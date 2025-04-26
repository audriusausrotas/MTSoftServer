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

router.get("/api/getUser", checkUser, auth.getUser);
router.get("/api/logout", checkUser, auth.logout);

router.post("/api/register", inputVerification, auth.register);
router.post("/api/login", inputVerification, auth.login);

/////////////////////// Archive //////////////////////////

router.get("/api/getUnconfirmed", checkAdmin, archive.getUnconfirmed);
router.get("/api/getArchives", checkAdmin, archive.getArchives);
router.get("/api/getDeleted", checkAdmin, archive.getDeleted);
router.get("/api/getBackup", checkAdmin, archive.getBackup);
router.get("/api/serviceSearch", archive.serviceSearch);
router.get("/api/getArchive/:_id", archive.getArchive);

router.delete("/api/deleteArchive", checkAdmin, archive.deleteArchive);

router.patch("/api/restoreArchive", checkAdmin, archive.restoreArchive);

router.post("/api/addUnconfirmed/:_id", checkAdmin, archive.addUnconfirmed);
router.post("/api/addArchive/:_id", checkAdmin, archive.addArchive);

/////////////////////// Bonus ////////////////////////////

router.get("/api/getBonus", checkAdmin, bonus.getBonus);

/////////////////////// Clients //////////////////////////

router.get("/api/getClients", checkAdmin, clients.getClients);

router.delete("/api/deleteClient/:_id", checkAdmin, clients.deleteClient);

router.post("/api/newClient", checkAdmin, clients.newClient);

/////////////////////// Comments /////////////////////////

router.delete("/api/deleteInstallationComment", checkUser, comments.deleteInstallationComment);
router.delete("/api/deleteProductionComment", checkUser, comments.deleteProductionComment);
router.delete("/api/deleteProjectComment", checkUser, comments.deleteProjectComment);

router.post("/api/addInstallationComment", checkUser, comments.addInstallationComment);
router.post("/api/addProductionComment", checkUser, comments.addProductionComment);
router.post("/api/addProjectComment", checkUser, comments.addProjectComment);

/////////////////////// Email ////////////////////////////

router.post("/api/sendRetailOffers", checkAdmin, email.sendRetailOffers);
router.post("/api/sendGateInfo", checkAdmin, email.sendGateInfo);
router.post("/api/sendOffer", checkAdmin, email.sendOffer);

/////////////////////// Gates ////////////////////////////

router.get("/api/getGates", checkUser, gates.getGates);

router.delete("/api/cancelOrder/:_id", checkAdmin, gates.cancelOrder);
router.delete("/api/finishOrder/:_id", checkUser, gates.finishOrder);

router.patch("/api/updateOrder", checkUser, gates.updateOrder);

router.post("/api/newOrder", checkAdmin, gates.newOrder);

/////////////////////// Installation /////////////////////

router.get("/api/getWorks", checkUser, installation.getWorks);

router.delete("/api/deleteInstallation/:_id", checkAdmin, installation.deleteInstallation);
router.delete("/api/deleteWorker", checkAdmin, installation.deleteWorker);

router.patch("/api/updateInstallation", checkUser, installation.updateInstallation);
router.patch("/api/partsDelivered", checkUser, installation.partsDelivered);
router.patch("/api/updateInstallationPostone", checkUser, installation.updatePostone);
router.patch("/api/updateInstallationStatus", checkUser, installation.updateStatus);

router.post("/api/addInstallation", checkAdmin, installation.addInstallation);

/////////////////////// Orders ///////////////////////////

router.get("/api/getOrder/:_id", order.getOrder);

router.patch("/api/changeOrderStatus", order.changeOrderStatus);

/////////////////////// Potential Clients ////////////////

router.get("/api/getpotentialClients", checkAdmin, potentialClient.getUsers);

router.delete("/api/deletePotentialClient/:_id", checkAdmin, potentialClient.deletePotentialClient);

router.patch("/api/selectClients", checkAdmin, potentialClient.selectClients);
router.patch("/api/updateClient", checkAdmin, potentialClient.updateClient);

router.post("/api/newPotentialClient", checkAdmin, potentialClient.newPotentialClient);

/////////////////////// Products /////////////////////////

router.get("/api/getProducts", checkAdmin, product.getProducts);

router.delete("/api/deleteProduct/:_id", checkAdmin, product.deleteProduct);

router.patch("/api/updateProduct", checkAdmin, product.updateProduct);

router.post("/api/newProduct", checkAdmin, product.newProduct);

/////////////////////// Production ///////////////////////

router.get("/api/getProduction", checkUser, production.getProduction);

router.delete("/api/deleteProduction/:_id", checkAdmin, production.deleteProduction);
router.delete("/api/deleteBindings", checkAdmin, production.deleteBindings);
router.delete("/api/deleteMeasure", checkAdmin, production.deleteMeasure);
router.delete("/api/deleteFence", checkAdmin, production.deleteFence);

router.patch("/api/updateProductionPostone", checkAdmin, production.updatePostone);
router.patch("/api/updateMeasure", checkAdmin, production.updateMeasure);
router.patch("/api/updateProductionStatus", checkUser, production.updateStatus);

router.post("/api/newProduction/:_id", checkUser, production.newProduction);
router.post("/api/addNewProduction", checkUser, production.addNewProduction);
router.post("/api/addBinding/:_id", checkAdmin, production.addBinding);
router.post("/api/addMeasure", checkAdmin, production.addMeasure);

/////////////////////// Project //////////////////////////

router.get("/api/getProjects", checkUser, project.getProjects);
router.get("/api/getProject", checkUser, project.getProjects);

router.delete("/api/removeUnconfirmed", checkAdmin, project.removeUnconfirmed);
router.delete("/api/deleteProject/:_id", checkAdmin, project.deleteProject);
router.delete("/api/deleteVersion", checkAdmin, project.deleteVersion);

router.patch("/api/extendExparationDate/:_id", checkAdmin, project.extendExparationDate);
router.patch("/api/versionRollback", checkAdmin, project.versionRollback);
router.patch("/api/projectFinished/:_id", checkAdmin, project.projectFinished);
router.patch("/api/updateProjectStatus", checkUser, project.updateStatus);
router.patch("/api/changeAdvance", checkAdmin, project.changeAdvance);
router.patch("/api/changeManager", checkAdmin, project.changeManager);
router.patch("/api/updateProject", checkAdmin, project.updateProject);
router.patch("/api/addFileProject", checkUser, project.addFiles);

router.post("/api/newProject", checkAdmin, project.newProject);

/////////////////////// Schedule /////////////////////////

router.get("/api/getSchedules", checkUser, schedule.getSchedules);

router.post("/api/addSchedule", checkAdmin, schedule.addSchedule);

/////////////////////// Settings /////////////////////////

router.get("/api/getDefaultValues", checkUser, settings.getDefaultValues);
router.get("/api/getUserRights", checkUser, settings.getUserRights);
router.get("/api/getSelects", checkUser, settings.getSelects);

router.delete("/api/deleteSelect", checkAdmin, settings.deleteSelect);

router.patch("/api/updateFenceData", checkAdmin, settings.updateFenceData);

router.post("/api/newDefaultValue", checkAdmin, settings.newDefaultValue);
router.post("/api/newUserRights", checkAdmin, settings.newUserRights);
router.post("/api/newSelect", checkAdmin, settings.newSelect);

/////////////////////// User /////////////////////////////

router.get("/api/getUsers", checkUser, user.getUsers);

router.patch("/api/updateUser", checkUser, user.updateUser);

router.delete("/api/deleteUser", checkAdmin, user.deleteUser);

router.patch("/api/updateProfile", checkUser, user.updateProfile);
router.patch("/api/updateUser", checkUser, user.updateUser);

/////////////////////// Uploads //////////////////////////

router.post("/api/uploadFiles", checkUser, uploads.uploadFiles);

router.delete("/api/deleteFiles", checkAdmin, uploads.deleteFiles);

export default router;
