import inputVerification from "../middleware/inputVerification";
import potentialClient from "../controllers/potentialClient";
import authMiddleware from "../middleware/authMiddleware";
import installation from "../controllers/installation";
import cloudinary from "../controllers/cloudinary";
import production from "../controllers/production";
import comments from "../controllers/comments";
import settings from "../controllers/settings";
import schedule from "../controllers/schedule";
import product from "../controllers/product";
import project from "../controllers/project";
import clients from "../controllers/clients";
import archive from "../controllers/archive";
import backup from "../controllers/backup";
import bonus from "../controllers/bonus";
import email from "../controllers/email";
import gates from "../controllers/gates";
import order from "../controllers/order";
import auth from "../controllers/auth";
import user from "../controllers/user";
import express from "express";

const router = express.Router();

/////////////////////// Auth /////////////////////////////

router.get("/getUsers", authMiddleware, auth.getUsers);

router.patch("/logout", auth.logout);

router.post("/register", inputVerification, auth.register);
router.post("/login", inputVerification, auth.login);
router.post("/getUser", authMiddleware, auth.getUser);

/////////////////////// Archive //////////////////////////

router.get("/getArchives", archive.getArchives);
router.get("/getArchive", archive.getArchive);
router.get("/getUnconfirmed", archive.getUnconfirmed);
router.get("/getDeleted", archive.getDeleted);
router.get("/serviceCheck", archive.serviceCheck);

router.delete("/deleteArchive", archive.deleteArchive);
router.delete("/deleteDeleted", archive.deleteDeleted);
router.delete("/deleteUnconfirmed", archive.deleteUnconfirmed);

router.patch("/restoreArchive", archive.restoreArchive);
router.post("/newArchive", archive.newArchive);
router.post("/addUnconfirmed", archive.addUnconfirmed);

/////////////////////// Backup ///////////////////////////

router.get("/getBackup", backup.getBackup);

/////////////////////// Bonus ////////////////////////////

router.get("/getBonus", bonus.getBonus);

/////////////////////// Clients //////////////////////////

router.get("/getClients", clients.getClients);

router.delete("/deleteClient", clients.deleteClient);

router.post("/newClient", clients.newClient);

/////////////////////// Cloudinary ///////////////////////

router.delete("/imageDelete", cloudinary.imageDelete);
router.delete("/deletePhoto", cloudinary.deletePhoto);

router.post("/addPhoto", cloudinary.addPhoto);

/////////////////////// Comments /////////////////////////

router.delete("/deleteProductionComment", comments.deleteProductionComment);
router.delete("/deleteInstallationComment", comments.deleteInstallationComment);
router.delete("/deleteProjectComment", comments.deleteProjectComment);

router.post("/addProductionComment", comments.addProductionComment);
router.post("/addInstallationComment", comments.addInstallationComment);
router.post("/addProjectComment", comments.addProjectComment);

/////////////////////// Email ////////////////////////////

router.post("/sendRetailOffers", email.sendRetailOffers);
router.post("/sendOffer", email.sendOffer);
router.post("/sendGateInfo", email.sendGateInfo);

/////////////////////// Gates ////////////////////////////

router.get("/getGates", gates.getGates);
router.get("/getGate", gates.getGate);

router.delete("/cancelOrder", gates.cancelOrder);

router.patch("/finishOrder", gates.finishOrder);
router.patch("/updateOrder", gates.updateOrder);

router.post("/newOrder", gates.newOrder);

/////////////////////// Installation /////////////////////

router.get("/getWorks", installation.getWorks);
router.get("/getWork", installation.getWork);

router.delete("/deleteWork", installation.deleteWork);
router.delete("/deleteWorker", installation.deleteWorker);

router.patch("/partsDelivered", installation.partsDelivered);
router.patch("/updatePostone", installation.updatePostone);
router.patch("/updateInstallation", installation.updateInstallation);
router.patch("/updateStatus", installation.updateStatus);

router.post("/addInstallation", installation.addInstallation);

/////////////////////// Orders ///////////////////////////

router.get("/getOrder", order.getOrder);

router.patch("/confirmOrder", order.confirmOrder);
router.patch("/declineOrder", order.declineOrder);

/////////////////////// Potential Clients ////////////////

router.get("/getUsers", potentialClient.getUsers);

router.delete("/deleteClient", potentialClient.deleteClient);

router.patch("/selectClients", potentialClient.selectClients);
router.patch("/updateClient", potentialClient.updateClient);

router.post("/newClient", potentialClient.newClient);

/////////////////////// Products /////////////////////////

router.get("/getProducts", product.getProducts);

router.delete("/deleteProduct", product.deleteProduct);

router.patch("/updateProduct", product.updateProduct);

router.post("/newProduct", product.newProduct);

/////////////////////// Production ///////////////////////

router.get("/getProductions", production.getProductions);
router.get("/getProduction", production.getProduction);

router.delete("/deleteProduction", production.deleteProduction);
router.delete("/deleteBindings", production.deleteBindings);
router.delete("/deleteMeasure", production.deleteMeasure);
router.delete("/deleteFence", production.deleteFence);

router.patch("/updatePostone", production.updatePostone);
router.patch("/updateStatus", production.updateStatus);
router.patch("/updateMeasure", production.updateMeasure);

router.post("/newProduction", production.newProduction);
router.post("/addNewGamyba", production.addNewGamyba);
router.post("/addBinding", production.addBinding);
router.post("/addMeasure", production.addMeasure);

/////////////////////// Project //////////////////////////

router.get("/getProjects", project.getProjects);
router.get("/getProject", project.getProject);

router.delete("/deleteProject", project.deleteProject);
router.delete("/removeUnconfirmed", project.removeUnconfirmed);
router.delete("/deleteVersion", project.deleteVersion);

router.patch("/changeAdvance", project.changeAdvance);
router.patch("/changeManager", project.changeManager);
router.patch("/extendExparationDate", project.extendExparationDate);
router.patch("/versionRollback", project.versionRollback);
router.patch("/updateStatus", project.updateStatus);
router.patch("/updateProject", project.updateProject);
router.patch("/newProject", project.newProject);

/////////////////////// Schedule /////////////////////////

router.get("/getSchedules", schedule.getSchedules);

router.post("/addSchedule", schedule.addSchedule);

/////////////////////// Settings /////////////////////////

router.get("/getDefaultValues", settings.getDefaultValues);
router.get("/getSelects", settings.getSelects);
router.get("/getUserRights", settings.getUserRights);

router.delete("/deleteSelect", settings.deleteSelect);

router.patch("/updateFenceData", settings.updateFenceData);

router.post("/newDefaultValue", settings.newDefaultValue);
router.post("/newSelect", settings.newSelect);
router.post("/newUserRights", settings.newUserRights);

/////////////////////// User /////////////////////////////

router.get("/getUsers", user.getUsers);

router.delete("/deleteUser", user.deleteUser);

router.patch("/updateProfile", user.updateProfile);
router.patch("/updateUser", user.updateUser);

export default router;
