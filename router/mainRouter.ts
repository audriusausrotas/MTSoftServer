import inputVerification from "../middleware/inputVerification";
import potentialClient from "../controllers/potentialClient";
import installation from "../controllers/installation";
import production from "../controllers/production";
import checkAdmin from "../middleware/checkAdmin";
import checkUser from "../middleware/checkUser";
import comments from "../controllers/comments";
import settings from "../controllers/settings";
import schedule from "../controllers/schedule";
import product from "../controllers/product";
import project from "../controllers/project";
import uploads from "../controllers/uploads";
import clients from "../controllers/clients";
import archive from "../controllers/archive";
import bonus from "../controllers/bonus";
import email from "../controllers/email";
import gates from "../controllers/gates";
import order from "../controllers/order";
import auth from "../controllers/auth";
import user from "../controllers/user";
import express from "express";

const router = express.Router();

/////////////////////// Auth /////////////////////////////

router.get("/getUser", checkUser, auth.getUser);
router.get("/logout", checkUser, auth.logout);

router.post("/register", inputVerification, auth.register);
router.post("/login", inputVerification, auth.login);

/////////////////////// Archive //////////////////////////

router.get("/getUnconfirmed", checkAdmin, archive.getUnconfirmed);
router.get("/getArchives", checkAdmin, archive.getArchives);
router.get("/getDeleted", checkAdmin, archive.getDeleted);
router.get("/getBackup", checkAdmin, archive.getBackup);
router.get("/serviceSearch", archive.serviceSearch);
router.get("/getArchive/:_id", archive.getArchive);

router.delete("/deleteArchive", checkAdmin, archive.deleteArchive);

router.patch("/restoreArchive", checkAdmin, archive.restoreArchive);

router.post("/addUnconfirmed/:_id", checkAdmin, archive.addUnconfirmed);
router.post("/addArchive/:_id", checkAdmin, archive.addArchive);

/////////////////////// Bonus ////////////////////////////

router.get("/getBonus", checkAdmin, bonus.getBonus);

/////////////////////// Clients //////////////////////////

router.get("/getClients", checkAdmin, clients.getClients);

router.delete("/deleteClient/:_id", checkAdmin, clients.deleteClient);

router.post("/newClient", checkAdmin, clients.newClient);

/////////////////////// Comments /////////////////////////

router.delete("/deleteInstallationComment", checkUser, comments.deleteInstallationComment);
router.delete("/deleteProductionComment", checkUser, comments.deleteProductionComment);
router.delete("/deleteProjectComment", checkUser, comments.deleteProjectComment);

router.post("/addInstallationComment", checkUser, comments.addInstallationComment);
router.post("/addProductionComment", checkUser, comments.addProductionComment);
router.post("/addProjectComment", checkUser, comments.addProjectComment);

/////////////////////// Email ////////////////////////////

router.post("/sendRetailOffers", checkAdmin, email.sendRetailOffers);
router.post("/sendGateInfo", checkAdmin, email.sendGateInfo);
router.post("/sendOffer", checkAdmin, email.sendOffer);

/////////////////////// Gates ////////////////////////////

router.get("/getGates", checkUser, gates.getGates);

router.delete("/cancelOrder/:_id", checkAdmin, gates.cancelOrder);
router.delete("/finishOrder/:_id", checkUser, gates.finishOrder);

router.patch("/updateOrder", checkUser, gates.updateOrder);

router.post("/newOrder", checkAdmin, gates.newOrder);

/////////////////////// Installation /////////////////////

router.get("/getWorks", checkUser, installation.getWorks);

router.delete("/deleteInstallation/:_id", checkAdmin, installation.deleteInstallation);
router.delete("/deleteWorker", checkAdmin, installation.deleteWorker);

router.patch("/updateInstallation", checkUser, installation.updateInstallation);
router.patch("/partsDelivered", checkUser, installation.partsDelivered);
router.patch("/updateInstallationPostone", checkUser, installation.updatePostone);
router.patch("/updateInstallationStatus", checkUser, installation.updateStatus);

router.post("/addInstallation", checkAdmin, installation.addInstallation);

/////////////////////// Orders ///////////////////////////

router.get("/getOrder/:_id", order.getOrder);

router.patch("/changeOrderStatus", order.changeOrderStatus);

/////////////////////// Potential Clients ////////////////

router.get("/getpotentialClients", checkAdmin, potentialClient.getUsers);

router.delete("/deleteClient/:_id", checkAdmin, potentialClient.deleteClient);

router.patch("/selectClients", checkAdmin, potentialClient.selectClients);
router.patch("/updateClient", checkAdmin, potentialClient.updateClient);

router.post("/newClient", checkAdmin, potentialClient.newClient);

/////////////////////// Products /////////////////////////

router.get("/getProducts", checkAdmin, product.getProducts);

router.delete("/deleteProduct/:_id", checkAdmin, product.deleteProduct);

router.patch("/updateProduct", checkAdmin, product.updateProduct);

router.post("/newProduct", checkAdmin, product.newProduct);

/////////////////////// Production ///////////////////////

router.get("/getProduction", checkUser, production.getProduction);

router.delete("/deleteProduction/:_id", checkAdmin, production.deleteProduction);
router.delete("/deleteBindings", checkAdmin, production.deleteBindings);
router.delete("/deleteMeasure", checkAdmin, production.deleteMeasure);
router.delete("/deleteFence", checkAdmin, production.deleteFence);

router.patch("/updateProductionPostone", checkAdmin, production.updatePostone);
router.patch("/updateMeasure", checkAdmin, production.updateMeasure);
router.patch("/updateProductionStatus", checkUser, production.updateStatus);

router.post("/newProduction/:_id", checkUser, production.newProduction);
router.post("/addNewGamyba", checkUser, production.addNewGamyba);
router.post("/addBinding/:_id", checkAdmin, production.addBinding);
router.post("/addMeasure", checkAdmin, production.addMeasure);

/////////////////////// Project //////////////////////////

router.get("/getProjects", checkUser, project.getProjects);
router.get("/getProject", checkUser, project.getProjects);

router.delete("/removeUnconfirmed", checkAdmin, project.removeUnconfirmed);
router.delete("/deleteProject/:_id", checkAdmin, project.deleteProject);
router.delete("/deleteVersion", checkAdmin, project.deleteVersion);

router.patch("/extendExparationDate/:_id", checkAdmin, project.extendExparationDate);
router.patch("/versionRollback", checkAdmin, project.versionRollback);
router.patch("/changeAdvance", checkAdmin, project.changeAdvance);
router.patch("/changeManager", checkAdmin, project.changeManager);
router.patch("/updateProject", checkAdmin, project.updateProject);
router.patch("/updateProjectStatus", checkUser, project.updateStatus);
router.patch("/addFileProject", checkUser, project.addFiles);

router.post("/newProject", checkAdmin, project.newProject);

/////////////////////// Schedule /////////////////////////

router.get("/getSchedules", checkUser, schedule.getSchedules);

router.post("/addSchedule", checkAdmin, schedule.addSchedule);

/////////////////////// Settings /////////////////////////

router.get("/getDefaultValues", checkUser, settings.getDefaultValues);
router.get("/getUserRights", checkUser, settings.getUserRights);
router.get("/getSelects", checkUser, settings.getSelects);

router.delete("/deleteSelect", checkAdmin, settings.deleteSelect);

router.patch("/updateFenceData", checkAdmin, settings.updateFenceData);

router.post("/newDefaultValue", checkAdmin, settings.newDefaultValue);
router.post("/newUserRights", checkAdmin, settings.newUserRights);
router.post("/newSelect", checkAdmin, settings.newSelect);

/////////////////////// User /////////////////////////////

router.get("/getUsers", checkUser, user.getUsers);

router.patch("/updateUser", checkUser, user.updateUser);

router.delete("/deleteUser", checkAdmin, user.deleteUser);

router.patch("/updateProfile", checkUser, user.updateProfile);
router.patch("/updateUser", checkUser, user.updateUser);

/////////////////////// Uploads //////////////////////////

router.post("/uploadFiles", checkUser, uploads.uploadFiles);

router.delete("/deleteFiles", checkAdmin, uploads.deleteFiles);

export default router;
