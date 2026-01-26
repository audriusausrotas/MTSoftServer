import { Request, Response } from "express";
import response from "../modules/response";
import emit from "../sockets/emits";
import orderSchema from "../schemas/orderSchema";
import projectSchema from "../schemas/projectSchema";
import sendEmail from "../modules/sendEmail";
import { truncate } from "fs/promises";
import { Order, Supplier } from "../data/interfaces";

export default {
  //////////////////// get requests ////////////////////////////////////

  getOrders: async (req: Request, res: Response) => {
    try {
      const user = res.locals.user;

      const data = await orderSchema.find();

      const responseData =
        user.accountType === "Administratorius" ||
        user.accountType === "Vadybininkas" ||
        user.accountType === "Sandėlys"
          ? data
          : data.filter(
              (item) =>
                item.recipient.some((recipient: Supplier) => recipient.email === user.email) &&
                item.status,
            );

      if (!responseData) return response(res, false, null, "Užsakymai nerasti");

      return response(res, true, responseData, "Užsakymi rasti");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// delete requests /////////////////////////////////

  deleteOrder: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      const responseData = await orderSchema.findByIdAndDelete(_id);

      if (!responseData) return response(res, false, null, "Užsakymas nerastas");

      emit.toAdmin("deleteOrder", { _id });
      emit.toOrders("deleteOrder", { _id });
      emit.toWarehouse("deleteOrder", { _id });

      return response(res, true, { _id }, "Užsakymas ištrintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// update requests /////////////////////////////////

  updateOrder: async (req: Request, res: Response) => {
    try {
      const { _id, dataIndex, data } = req.body;

      const updatePath = `data.${dataIndex}`;
      const updated = await orderSchema.findByIdAndUpdate(
        _id,
        { $set: { [updatePath]: data } },
        { new: true },
      );

      if (!updated) return response(res, false, null, "Užsakymas nerastas");

      const responseData = { _id, dataIndex, data: updated.data[dataIndex] };

      emit.toAdmin("updateOrder", responseData);
      emit.toOrders("updateOrder", responseData);
      emit.toWarehouse("updateOrder", responseData);

      return response(res, true, responseData, "Išsaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  finishOrder: async (req: Request, res: Response) => {
    try {
      const { _id, projectID } = req.body;

      const data = await orderSchema.findByIdAndUpdate(_id, { status: false }, { new: true });
      if (!data) return response(res, false, null, "Užsakymas nerastas");

      const project = await projectSchema.findById(projectID);
      if (!project) return response(res, false, null, "Užsakymas nerastas");

      data.data.forEach((item) => {
        project.results[item.measureIndex].delivered = item.delivered;
      });

      await project.save();

      const responseData = { _id, projectID };

      emit.toAdmin("finishOrder", responseData);
      emit.toOrders("finishOrder", responseData);
      emit.toWarehouse("finishOrder", responseData);

      return response(res, true, responseData, "Išsaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  updateOrderNr: async (req: Request, res: Response) => {
    try {
      const { _id, value } = req.body;

      const data = await orderSchema.findByIdAndUpdate({ _id }, { orderNr: value });

      if (!data) return response(res, false, null, "Užsakymas nerastas");

      const responseData = { _id, value };

      emit.toAdmin("updateOrderNr", responseData);
      emit.toOrders("updateOrderNr", responseData);
      emit.toWarehouse("updateOrderNr", responseData);

      return response(res, true, responseData, "Išsaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  updateOrderFields: async (req: Request, res: Response) => {
    try {
      const { _id, dataIndex, field, value } = req.body;

      const updatePath = `data.${dataIndex}.${field}`;

      const data = await orderSchema.findOneAndUpdate(
        { _id },
        { $set: { [updatePath]: value } },
        { new: true },
      );

      if (!data) return response(res, false, null, "Užsakymas nerastas");

      const responseData = { _id, dataIndex, field, value };

      emit.toAdmin("updateOrderFields", responseData);
      emit.toOrders("updateOrderFields", responseData);
      emit.toWarehouse("updateOrderFields", responseData);

      return response(res, true, responseData, "Išsaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// post requests ///////////////////////////////////

  newOrder: async (req: Request, res: Response) => {
    try {
      const { _id, data, client, date, deliveryMethod, message, to, projectOrderNr } = req.body;

      const user = res.locals.user;

      const orderDate = new Date().toISOString();

      const comments = [];

      if (to.length > 1) {
        const recipients = to.map(
          (item: Supplier, index: number) =>
            `${item.username} (${item.email}) ${index + 1 === to.length ? "" : "ir "}`,
        );

        comments.push({
          date: orderDate.slice(0, 16).replace("T", " "),
          creator: user.username,
          comment: `Šis užsakymas priskirtas ${recipients.join(" ")}`,
        });
      }

      if (message) {
        comments.push({
          date: orderDate.slice(0, 16).replace("T", " "),
          creator: user.username,
          comment: message,
        });
      }

      const newOrder = new orderSchema({
        projectID: _id,
        projectOrderNr,
        creator: user,
        client,
        recipient: to,
        orderDate: orderDate.slice(0, 10),
        deliveryDate: date,
        deliveryMethod,
        comments: comments,
        data,
      });

      const orderData = await newOrder.save();

      if (!orderData) return response(res, false, null, "Serverio klaida");

      emit.toAdmin("newOrder", orderData);
      emit.toOrders("newOrder", orderData);
      emit.toWarehouse("newOrder", orderData);

      const materialsList = data
        .map(
          (result: any) => ` 
                <tr>
                  <td>${result.name}</td>
                  <td>${result.color}</td>
                  <td>${result.quantity}</td>
                </tr>`,
        )
        .join("");

      const commentsList = comments
        .map((c: any, index: number) =>
          index === 0
            ? `<p style="font-weight: bold; color: #333; background-color: #f0f0f0; padding: 10px; border-left: 4px solid #333;">${c.comment}</p>`
            : `<p>${c.comment}</p>`,
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

        ${commentsList}
        <br>

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

      const emailPromises = to.map((recipient: Supplier) =>
        sendEmail({
          to: recipient.email,
          subject: `Naujas užsakymas - ${client.address}`,
          html,
          user,
        }),
      );

      const emailResults = await Promise.all(emailPromises);

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
        emailResults.every((result) => result.success),
        { _id, data, orderData },
        emailResults.every((result) => result.success)
          ? "Medžiagos užsakytos"
          : "Ne visi vartotojai gavo užsakymą",
      );
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
