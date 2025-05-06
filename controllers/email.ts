import projectSchema from "../schemas/projectSchema";
import sendEmail from "../modules/sendEmail";
import { Request, Response } from "express";
import response from "../modules/response";
import formidable from "formidable";
import emit from "../sockets/emits";
import fs from "fs";

export default {
  sendRetailOffers: async (req: Request, res: Response) => {
    try {
      const form = formidable({ multiples: true, keepExtensions: true });

      const { fields, files } = await new Promise<{ fields: any; files: any }>(
        (resolve, reject) => {
          form.parse(req, (err, fields, files) => {
            if (err) {
              reject(err);
            } else {
              resolve({ fields, files });
            }
          });
        }
      );

      const user = res.locals.user;

      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      const message = Array.isArray(fields.message) ? fields.message[0] : fields.message;

      if (!fields.to) throw new Error("Missing recipients");

      const recipients = JSON.parse(fields.to as string);

      const attachments = Object.values(files).map((file: any) => {
        return {
          filename: file[0]?.originalFilename,
          content: fs.createReadStream(file[0]?.filepath),
          contentType: file[0]?.mimetype,
        };
      });

      const success = [];

      for (const recipient of recipients) {
        const emailResult = await sendEmail({
          to: recipient.email,
          subject: title,
          html: message,
          user,
          attachments,
        });

        success.push({ success: emailResult.success, email: recipient.email });
      }

      return response(
        res,
        success.every((status) => status.success),
        null,
        success.every((status) => status.success)
          ? "Pasiūlymai išsiųsti"
          : "Kai kurie pasiūlymai neišsiųsti"
      );
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  sendOffer: async (req: Request, res: Response) => {
    try {
      const { to, link, title } = req.body;

      const user = res.locals.user;

      let html = `
      <html>
    <body>
        <p style="font-weight: 500"">Laba diena.</p> 
        <p style="font-weight: 500"">Tvoros pasiūlymą galite peržiūrėti paspaudę ant žemiau esančios nuorodos:</p>
        <a href="https://mtsoft.lt/pasiulymas/${link}" style="font-size: large; font-weight: 500"> Tvoros pasiūlymas</a>
        <br/>
        <br/>
        <p style="font-weight: 500""> Mūsų tvorų asortimentą su kainomis galite </p>
        <a href="https://mtsoft.lt/tvoros" style="font-size: large; font-weight: 500"> peržiūrėti čia</a>
        <br/>
        <br/>
        <br/>
        <br/>
        <div dir="auto">
            <span style="color:rgb(34, 34, 34);font-family:Arial, Helvetica, sans-serif;font-size: small">--</span>
            <span style="font-size: small"><br/></span>
            <span style="color:rgb(34, 34, 34);font-family:Arial, Helvetica, sans-serif;font-size: small">Pagarbiai,</span>
            <span style="font-size: small"><br/></span>
            <span style="font-size: small"><br/></span>
            <img height="auto" src="https://ci3.googleusercontent.com/mail-sig/AIorK4zCu_lclbKFFFaK1zc3I3KLAa0ziF68nA82jn1EFei1wF9QSJorYDnoF8DsH2GJm4mGsk5a0vM"/>
            <span style="font-size: small"><br/></span>
            <span style="font-size: small"><br/></span>
            <span style="color:var(--textColor);background-color:var(--backgroundColor);font-family:Arial, Helvetica, sans-serif;font-size: small">${user.username} ${user.lastName}</span>
            <span style="font-size: small"><br/></span>
            <a style="color:rgb(10, 132, 255);font-family:Arial, Helvetica, sans-serif;font-size: small" href="tel:${user.phone}">${user.phone}</a>
            <span style="font-size: small"><br/></span>
            <a style="font-family:Arial, Helvetica, sans-serif;font-size: small" href="mailto:${user.email}" target="_blank">${user.email}</a>
            <span style="font-size: small"><br/></span>
            <a style="font-family:Arial, Helvetica, sans-serif;font-size: small" href="mailto:info@modernitvora.lt" target="_blank">info@modernitvora.lt</a>
            <span style="font-size: small"><br/></span>
            <a style="font-family:Arial, Helvetica, sans-serif;font-size: small" href="http://www.modernitvora.lt/" target="_blank">www.modernitvora.lt</a>
            <span style="font-size: small"><br/></span>
            <span style="font-size: small"><br/></span>
            <img height="auto" src="https://ci3.googleusercontent.com/mail-sig/AIorK4wfuU34RbqGXJR-ortQoI9YmGMfkpKL-hY5fDONfReBjW39FIiEkWwLZ-q-ynS_GE-v_phA_5c"/>
            <span style="font-size: small"><br/></span>
            <span style="font-size: small"><br/></span>
            <span style="color:var(--textColor);background-color:var(--backgroundColor);font-family:Arial, Helvetica, sans-serif;font-size: small">PASTABA DĖL KONFIDENCIALUMO. Šis el. laiškas ir jo priedas (-ai) yra skirti tik tam asmeniui, kuriam jie adresuoti, o juose esanti informacija gali būti slapta ir (ar) konfidenciali. Tokios informacijos atskleidimas gali būti draudžiamas įstatymų. Griežtai draudžiama peržiūrėti, atskleisti, kopijuoti, platinti ar imtis bet kokių veiksmų, susijusių su šios informacijos panaudojimu, asmenims, kurie nėra numatyti kaip šio el. laiško gavėjai. Jei šį el. laišką gavote per klaidą, prašome apie tokios žinutės gavimą nedelsiant pranešti siuntėjui ir ištrinti žinutę ir visus jos priedus iš savo informacinės sistemos. Ačiū.</span>
        </div>
    </body>
    
      </html>
    `;

      const emailResult = await sendEmail({
        to,
        subject: title || "Tvoros pasiūlymas",
        html,
        user,
      });

      return response(
        res,
        emailResult.success,
        null,
        emailResult.success ? "Pasiūlymas išsiūstas" : emailResult.message
      );
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  sendGateInfo: async (req: Request, res: Response) => {
    try {
      const { to, message, title } = req.body;

      const user = res.locals.user;

      let html = `
      <html>
    <body>
        <p style="font-weight: 500"">Labas.</p> 
        <p style="font-weight: 500"">${message}</p>
    </body>
    
      </html>
    `;

      const emailResult = await sendEmail({
        to,
        subject: title || "Tvoros pasiūlymas",
        html,
        user,
      });

      return response(
        res,
        emailResult.success,
        null,
        emailResult.success ? "Pasiūlymas išsiūstas" : emailResult.message
      );
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  orderProducts: async (req: Request, res: Response) => {
    try {
      const { _id, data, client, date, deliveryMethod, message, to } = req.body;

      const user = res.locals.user;

      const materialsList = data

        .map(
          (result: any) => ` 
                <tr>
                  <td>${result.name}</td>
                  <td>${result.color}</td>
                  <td>${result.quantity}</td>
                </tr>`
        )
        .join("");

      const html = `
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            padding: 20px;
          }
          h2 {
            color: #333;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .info-table th, .info-table td
           {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
          }
          .info-table th {
            background-color: #f4f4f4;
            font-weight: bold;
          }
          .highlight {
            font-weight: bold;
            color: #2c3e50;
          }
        </style>
      </head>
      <body>

        <h2>Naujas užsakymas</h2>

        <p>${message}</p>

        <table class="info-table">
          <tr>
            <th>Klientas</th>
            <td>${client.username}</td>
          </tr>
          <tr>
            <th>Adresas</th>
            <td>${client.address}</td>
          </tr>
          <tr>
            <th>Telefono numeris</th>
            <td>${client.phone}</td>
          </tr>
          <tr>
            <th>Elektroninio pašto adresas</th>
            <td>${client.email}</td>
          </tr>
          <tr>
            <th>Pristatymo vieta</th>
            <td>${deliveryMethod}</td>
          </tr>
          <tr>
            <th>Pristatymo data iki</th>
            <td>${date}</td>
          </tr>
        </table>

        <h2>Medžiagos</h2>
        <table class="info-table">
          <thead>
            <tr>
              <th>Pavadinimas</th>
              <th>Spalva</th>
              <th>Kiekis</th>
            </tr>
          </thead>
          <tbody>
            ${materialsList}
          </tbody>
        </table>

      </body>
      </html>
    `;

      const emailResult = await sendEmail({
        to,
        subject: `Naujas užsakymas - ${client.address}`,
        html,
        user,
      });

      const project = await projectSchema.findById(_id);

      if (!project) return response(res, false, null, "Projektas nerastas");

      for (const item of data) {
        project.results[item.measureIndex].ordered = true;

        const responseData = {
          _id,
          measureIndex: item.measureIndex,
          value: true,
        };
        const savedProject = await project.save();

        emit.toAdmin("partsOrdered", responseData);
        emit.toInstallation("partsOrdered", responseData);
        emit.toWarehouse("partsOrdered", responseData);
      }

      return response(
        res,
        emailResult.success,
        { _id, data },
        emailResult.success ? "Medžiagos užsakytos" : emailResult.message
      );
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
