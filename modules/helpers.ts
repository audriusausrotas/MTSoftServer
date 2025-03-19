import installationSchema from "../schemas/installationSchema";
import { MontavimasFence, Project } from "../data/interfaces";
import projectSchema from "../schemas/projectSchema";
import { HydratedDocument, Types } from "mongoose";
import nodemailer from "nodemailer";
import { Response } from "express";
import response from "./response";

export async function sendEmail({ to, subject, html, user, attachments }: any) {
  let fromPass: string = "";

  if (user.email.includes("audrius")) {
    fromPass = process.env.nodemailerPassAudrius!;
  } else if (user.email.includes("andrius")) {
    fromPass = process.env.nodemailerPassAndrius!;
  } else if (user.email.includes("pardavimai")) {
    fromPass = process.env.nodemailerPassHaris!;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user.email,
      pass: fromPass,
    },
  });

  try {
    await transporter.sendMail({
      from: "Moderni Tvora " + user.email,
      to,
      subject: subject,
      html,
      attachments,
    });
    return {
      success: true,
      message: "Email sent successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Error: " + error.message,
    };
  }
}

export async function processJob(_id: Types.ObjectId, worker: string, res: Response) {
  const project: HydratedDocument<Project> | null = await projectSchema.findById(_id);

  if (!project) return response(res, false, null, "Projektas nerastas");

  const montavimas = await installationSchema.findById(project._id);

  const newFences: MontavimasFence[] = project.fenceMeasures.map((item) => {
    return {
      ...item,
      measures: item.measures.map((measure) => ({
        ...measure,
        done: undefined,
        postone: false,
      })),
    };
  });

  if (montavimas) {
    if (montavimas.workers.includes(worker))
      return response(res, false, null, "Objektas jau montuojamas");
    else {
      montavimas.workers.push(worker);
      const data = await montavimas.save();
      return response(res, true, data, "Montavimas priskirtas");
    }
  } else {
    const newResults = project.results.map((item) => {
      return {
        type: item.type,
        quantity: item.quantity,
        height: item.height,
        width: item.width,
        color: item.color,
        category: item.category,
        delivered: false,
      };
    });

    const newWorks = project.works.map((item) => {
      return {
        name: item.name,
        quantity: item.quantity,
        delivered: false,
      };
    });

    const newMontavimas = new installationSchema({
      _id: project._id?.toString(),
      creator: { ...project.creator },
      client: { ...project.client },
      orderNumber: project.orderNumber,
      fences: newFences,
      results: newResults,
      works: newWorks,
      aditional: [],
      workers: [worker],
    });

    const data = await newMontavimas.save();
    if (!data) return response(res, false, null, "Įvyko klaida");

    project.status = "Montuojama";

    await project.save();

    return response(res, true, newMontavimas, "Perduota montavimui");
  }
}
