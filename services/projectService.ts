import { HydratedDocument, Types } from "mongoose";
import { Dates, Project, ProjectComment, User } from "../data/interfaces";
import projectSchema from "../schemas/projectSchema";
import emit from "../sockets/emits";
import { createBackup } from "./backupServices";
import sendEmail from "../modules/sendEmail";
import generateHTML from "../modules/generateHTML";

export async function createProjectService(body: any, user: any) {
  const {
    _id,
    client,
    fenceMeasures,
    results,
    works,
    gates,
    totalPrice,
    totalCost,
    totalProfit,
    totalMargin,
    priceVAT,
    priceWithDiscount,
    discount,
    status,
    advance,
    retail,
  } = body;

  const creator = {
    username: user.username,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
  };

  const projectExist = _id ? await findProjectById(_id) : null;

  const creatorUsername = projectExist ? projectExist.creator.username : creator.username;

  const orderNumber = await generateOrderNumber(creatorUsername);

  const dates = generateProjectDates();

  if (projectExist) {
    const cloned = cloneProject(projectExist, orderNumber, dates);
    const saved = await cloned.save();

    if (!saved) throw new Error("Projektas neišsaugotas");

    emit.toAdmin("newProject", saved);

    return saved;
  }

  const project = new projectSchema({
    creator,
    client,
    fenceMeasures,
    results,
    works,
    gates,
    totalPrice,
    totalCost,
    totalProfit,
    totalMargin,
    priceVAT,
    priceWithDiscount,
    discount,
    status,
    advance,
    dates,
    retail,
    orderNumber,
  });

  const newProject = await project.save();

  if (!newProject) throw new Error("Projektas neišsaugotas");

  emit.toAdmin("newProject", newProject);

  return newProject;
}

export function cloneProject(project: any, orderNumber: string, dates: Dates) {
  const clone = project.toObject();
  delete clone._id;

  clone.dates = dates;
  clone.orderNumber = orderNumber;
  clone.status = "Nepatvirtintas";
  clone.advance = 0;
  clone.versions = [];

  return new projectSchema(clone);
}

export async function generateOrderNumber(username: string) {
  const prefix = username.substring(0, 3).toUpperCase();

  const userProjects = await projectSchema.find({
    orderNumber: { $regex: `^${prefix}`, $options: "i" },
  });

  if (userProjects.length === 0) {
    return `${prefix}-0001`;
  }

  const last = userProjects
    .map((p) => parseInt(p.orderNumber.split("-")[1], 10))
    .sort((a, b) => a - b)
    .pop();

  if (!last) throw new Error("Nerastas paskutinis numeris");

  const next = (last + 1).toString().padStart(4, "0");

  return `${prefix}-${next}`;
}

export function generateProjectDates() {
  const now = new Date();
  const created = now.toISOString();

  const exp = new Date(now);
  exp.setDate(now.getDate() + 30);

  return {
    dateCreated: created,
    dateExparation: exp.toISOString(),
    dateConfirmed: "",
    dateCompletion: "",
    dateArchieved: "",
  };
}

export async function findProjectById(id: string | string[] | Types.ObjectId) {
  const normalizedId = Array.isArray(id) ? id[0] : id;

  const objectId =
    normalizedId instanceof Types.ObjectId ? normalizedId : new Types.ObjectId(normalizedId);

  const project = await projectSchema.findById(objectId);
  if (!project) throw new Error("Projektas nerastas");

  return project;
}

export async function changeCompletionDate(_id: Types.ObjectId, date: string) {
  const project = await projectSchema.findByIdAndUpdate(
    _id,
    { "dates.dateCompletion": date },
    { new: true },
  );
  if (!project) throw new Error("Projektas nerastas");

  const responseData = { _id, date };

  emit.toAdmin("changeCompletionDate", responseData);
  emit.toInstallation("changeCompletionDate", responseData);
  emit.toWarehouse("changeCompletionDate", responseData);

  return responseData;
}

export async function confirmProject(_id: Types.ObjectId) {
  const date = new Date().toISOString();

  const project = await projectSchema.findByIdAndUpdate(
    _id,
    { "dates.dateConfirmed": date },
    { new: true },
  );
  if (!project) throw new Error("Projektas nerastas");

  const responseData = { _id, dateConfirmed: date };

  emit.toAdmin("confirmProject", responseData);
  emit.toInstallation("confirmProject", responseData);
  emit.toWarehouse("confirmProject", responseData);

  return responseData;
}

export async function addProjectComment(_id: Types.ObjectId, comment: string, user: User) {
  const project = await findProjectById(_id);

  const newComment: ProjectComment = {
    comment,
    date: new Date().toISOString(),
    creator: user.username,
  };

  project.comments.unshift(newComment);

  const savedProject = await project.save();
  if (!savedProject) throw new Error("Klaida saugant komentarą");

  const responseData = { _id, comment: newComment };

  emit.toAdmin("newProjectComment", responseData);
  emit.toInstallation("newProjectComment", responseData);
  emit.toWarehouse("newProjectComment", responseData);

  return responseData;
}

export async function updateProjectStatus(id: any, value: string) {
  const project = await findProjectById(id);
  const oldStatus = project.status;

  project.status = value;

  const normalized = value.toLowerCase?.();

  const needsDates =
    normalized === "patvirtintas" ||
    normalized === "betonuojama" ||
    normalized === "gaminama" ||
    normalized === "montuojama" ||
    normalized === "laukiam vartų";

  if (needsDates) {
    const afterTwoMonths = new Date();
    afterTwoMonths.setMonth(afterTwoMonths.getMonth() + 2);

    if (!project.dates.dateConfirmed) project.dates.dateConfirmed = new Date().toISOString();
    if (!project.dates.dateCompletion) project.dates.dateCompletion = afterTwoMonths.toISOString();
  }

  const data = await project.save();
  if (!data) throw new Error("Klaida keičiant statusą");

  if (needsDates) {
    await createBackup(id, project);
  }

  if (normalized === "apmokėjimas" && oldStatus.toLowerCase() !== "apmokėjimas") {
    const html = generateHTML(project);
    await sendEmail({
      to: "vaida@modernitvora.lt",
      subject: "Baigtas objektas",
      user: project.creator,
      html,
    });
  }

  const payload = {
    _id: project._id.toString(),
    status: value,
  };

  if (needsDates) {
    emit.toAdmin("changeProjectDates", { _id: project._id.toString(), dates: project.dates });
  }

  emit.toAdmin("changeProjectStatus", payload);

  return payload;
}
