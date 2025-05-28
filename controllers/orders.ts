import { Request, Response } from "express";
import response from "../modules/response";
import emit from "../sockets/emits";
import orderSchema from "../schemas/orderSchema";

export default {
  //////////////////// get requests ////////////////////////////////////

  getOrders: async (req: Request, res: Response) => {
    try {
      const responseData = await orderSchema.find();

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

      if (!responseData)
        return response(res, false, null, "Užsakymas nerastas");

      emit.toAdmin("deleteOrder", { _id });
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
      const { _id } = req.body;

      // const responseData = await orderSchema.findByIdAndDelete(_id);

      // if (!responseData) return response(res, false, null, "Užsakymas nerastas");

      // emit.toAdmin("deleteOrder", { _id });
      // emit.toWarehouse("deleteOrder", { _id });

      return response(res, true, { _id }, "Užsakymas ištrintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// post requests ///////////////////////////////////

  newOrder: async (req: Request, res: Response) => {
    try {
      const { _id, data, client, date, deliveryMethod, message, to } = req.body;

      const user = res.locals.user;

      const orderDate = new Date().toISOString();

      const newComment = {
        date: orderDate.slice(0, 16).replace("T", " "),
        creator: user.username,
        comment: message,
      };

      const newOrder = new orderSchema({
        user,
        client,
        data,
        orderDate: orderDate.slice(0, 10),
        deliveryDate: date,
        deliveryMethod,
        comments: newComment,
        recipient: to,
      });

      const orderData = await newOrder.save();

      if (!orderData) return response(res, false, null, "Serverio klaida");

      emit.toAdmin("newOrder", orderData);
      emit.toWarehouse("newOrder", orderData);

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

      // const emailResult = await sendEmail({
      //   to,
      //   subject: `Naujas užsakymas - ${client.address}`,
      //   html,
      //   user,
      // });

      // const project = await projectSchema.findById(_id);

      // if (!project) return response(res, false, null, "Projektas nerastas");

      // for (const item of data) {
      //   project.results[item.measureIndex].ordered = true;

      //   const responseData = {
      //     _id,
      //     measureIndex: item.measureIndex,
      //     value: true,
      //   };
      //   const savedProject = await project.save();

      // emit.toAdmin("partsOrdered", responseData);
      // emit.toInstallation("partsOrdered", responseData);
      // emit.toWarehouse("partsOrdered", responseData);
      // }

      return response(res, true, { _id, data }, "asdf");
      // return response(
      //   res,
      //   emailResult.success,
      //   { _id, data, orderData },
      //   emailResult.success ? "Medžiagos užsakytos" : emailResult.message
      // );
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
