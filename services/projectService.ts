import { HydratedDocument } from "mongoose";
import { Dates, Project } from "../data/interfaces";
import projectSchema from "../schemas/projectSchema";
import emit from "../sockets/emits";

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

export async function updateProjectStatus(project: HydratedDocument<Project>, status: string) {
  project.status = status;
  const savedProject = await project.save();
  if (!savedProject) throw new Error("Projektas neišsaugotas");
  return savedProject;
}

export async function findProjectById(id: string) {
  if (!id) throw new Error("Projekto ID yra privalomas");
  const foundProject = await projectSchema.findById(id);
  if (!foundProject) throw new Error("Projektas nerastas");
  return foundProject;
}
