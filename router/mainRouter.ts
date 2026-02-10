import inputVerification from "../middleware/inputVerification";
import potentialClient from "../controllers/potentialClient";
import websiteSettings from "../controllers/websiteSettings";
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
import email from "../controllers/email";
import gates from "../controllers/gates";
import offer from "../controllers/offer";
import auth from "../controllers/auth";
import user from "../controllers/user";
import express from "express";
import suppliers from "../controllers/suppliers";
import orders from "../controllers/orders";
import checkSuperAdmin from "../middleware/checkSuperAdmin";

const router = express.Router();

/////////////////////// Auth /////////////////////////////

router.get("/getUser", checkUser, auth.getUser);
router.get("/logout", checkUser, auth.logout);

router.post("/register", inputVerification, auth.register);
router.post("/login", inputVerification, auth.login);

/////////////////////// Archive //////////////////////////

router.get("/getUnconfirmed", checkAdmin, archive.getUnconfirmed);
router.get("/getArchives", checkAdmin, archive.getArchives);
router.get("/getFinished", checkAdmin, archive.getFinished);
router.get("/getDeleted", checkAdmin, archive.getDeleted);
router.get("/getBackup", checkAdmin, archive.getBackup);
router.get("/getVersion/:_id", checkAdmin, archive.getVersion);
router.get("/serviceSearch", checkUser, archive.serviceSearch);
router.get("/getArchive/:_id", checkAdmin, archive.getArchive);

router.delete("/deleteArchive", checkAdmin, archive.deleteArchive);

router.patch("/restoreArchive", checkAdmin, archive.restoreArchive);

router.post("/addUnconfirmed/:_id", checkAdmin, archive.addUnconfirmed);
router.post("/addArchive/:_id", checkAdmin, archive.addArchive);

/////////////////////// Clients //////////////////////////

router.get("/getClients", checkAdmin, clients.getClients);

router.delete("/deleteClient/:_id", checkSuperAdmin, clients.deleteClient);

router.post("/newClient", checkAdmin, clients.newClient);

/////////////////////// Suppliers //////////////////////////

router.get("/getSuppliers", checkAdmin, suppliers.getSuppliers);

router.delete("/deleteSupplier/:_id", checkSuperAdmin, suppliers.deleteSupplier);

router.post("/newSupplier", checkAdmin, suppliers.newSupplier);

/////////////////////// Comments /////////////////////////

router.delete("/deleteProductionComment", checkUser, comments.deleteProductionComment);
router.delete("/deleteProjectComment", checkUser, comments.deleteProjectComment);
router.delete("/deleteOrderComment", checkUser, comments.deleteOrderComment);

router.post("/addProductionComment", checkUser, comments.addProductionComment);
router.post("/addProjectComment", checkUser, comments.addProjectComment);
router.post("/addOrderComment", checkUser, comments.addOrderComment);

/////////////////////// Email ////////////////////////////

router.post("/sendRetailOffers", checkAdmin, email.sendRetailOffers);
router.post("/sendGateInfo", checkAdmin, email.sendGateInfo);
router.post("/sendOffer", checkAdmin, email.sendOffer);

/////////////////////// Gates ////////////////////////////

router.get("/getGates", checkUser, gates.getGates);

router.delete("/cancelOrder/:_id", checkAdmin, gates.cancelOrder);
router.delete("/finishGateOrder/:_id", checkUser, gates.finishOrder);

router.patch("/updateGateOrder", checkUser, gates.updateGateOrder);

router.post("/newGateOrder", checkAdmin, gates.newOrder);

/////////////////////// Installation /////////////////////

router.get("/getWorks", checkUser, installation.getWorks);

router.delete("/deleteInstallation/:_id", checkAdmin, installation.deleteInstallation);
router.delete("/deleteWorker", checkAdmin, installation.deleteWorker);

router.patch("/updateInstallation", checkUser, installation.updateInstallation);
router.patch("/updateInstallationPostone", checkUser, installation.updatePostone);
router.patch("/updateInstallationStatus", checkUser, installation.updateStatus);

router.post("/addInstallation", checkAdmin, installation.addInstallation);

/////////////////////// Offer //////////////////////////////

router.get("/getOffer/:_id", offer.getOffer);

router.patch("/changeOfferStatus", offer.changeOfferStatus);

/////////////////////// Orders ////////////////////////////

router.get("/getOrders", checkUser, orders.getOrders);

router.delete("/deleteOrder/:_id", checkAdmin, orders.deleteOrder);

router.patch("/updateOrder", checkUser, orders.updateOrder);
router.patch("/updateOrderNr", checkUser, orders.updateOrderNr);
router.patch("/updateOrderFields", checkUser, orders.updateOrderFields);
router.patch("/finishOrder", checkUser, orders.finishOrder);

router.post("/newOrder", checkUser, orders.newOrder);

/////////////////////// Potential Clients ////////////////

router.get("/getpotentialClients", checkAdmin, potentialClient.getUsers);

router.delete("/deletePotentialClient/:_id", checkAdmin, potentialClient.deletePotentialClient);

router.patch("/selectClients", checkAdmin, potentialClient.selectClients);
router.patch("/updateClient", checkAdmin, potentialClient.updateClient);

router.post("/newPotentialClient", checkAdmin, potentialClient.newPotentialClient);
/////////////////////// Products /////////////////////////

router.get("/getProducts", checkAdmin, product.getProducts);

router.delete("/deleteProduct/:_id", checkAdmin, product.deleteProduct);

router.patch("/updateProduct", checkAdmin, product.updateProduct);

router.post("/newProduct", checkAdmin, product.newProduct);

/////////////////////// Production ///////////////////////

router.get("/getProductions", checkUser, production.getProductions);
router.get("/getProduction/:_id", checkUser, production.getProduction);

router.delete("/deleteProduction/:_id", checkAdmin, production.deleteProduction);
router.delete("/deleteBindings", checkAdmin, production.deleteBindings);
router.delete("/deleteMeasure", checkAdmin, production.deleteMeasure);
router.delete("/deleteFence", checkAdmin, production.deleteFence);

router.patch("/updateProductionPostone", checkAdmin, production.updatePostone);
router.patch("/updateMeasure", checkUser, production.updateMeasure);
router.patch("/updateProductionStatus", checkUser, production.updateStatus);
router.patch("/updateProductionGate", checkAdmin, production.updateGate);

router.post("/newProduction/:_id", checkUser, production.newProduction);
router.post("/addNewProduction", checkUser, production.addNewProduction);
router.post("/addBinding/:_id", checkAdmin, production.addBinding);
router.post("/addMeasure", checkAdmin, production.addMeasure);

/////////////////////// Project //////////////////////////

router.get("/getProjects", checkUser, project.getProjects);
router.get("/getProject/:_id", checkUser, project.getProject);

router.delete("/removeUnconfirmed", checkAdmin, project.removeUnconfirmed);
router.delete("/deleteProject/:_id", checkAdmin, project.deleteProject);
router.delete("/deleteVersion", checkAdmin, project.deleteVersion);

router.patch("/extendExparationDate/:_id", checkAdmin, project.extendExparationDate);
router.patch("/changeCompletionDate", checkUser, project.changeCompletionDate);
router.patch("/projectFinished/:_id", checkAdmin, project.projectFinished);
router.patch("/partsDelivered", checkUser, project.partsDelivered);
router.patch("/partsOrdered", checkUser, project.partsOrdered);
router.patch("/workDone", checkUser, project.workDone);
router.patch("/versionRollback", checkAdmin, project.versionRollback);
router.patch("/updateProjectStatus", checkUser, project.updateStatus);
router.patch("/changeAdvance", checkAdmin, project.changeAdvance);
router.patch("/changeManager", checkAdmin, project.changeManager);
router.patch("/updateProject", checkAdmin, project.updateProject);
router.patch("/addGateManufacturer", checkAdmin, project.addGateManufacturer);

router.post("/newProject", checkAdmin, project.newProject);

/////////////////////// Schedule /////////////////////////

router.get("/getSchedules", checkUser, schedule.getSchedules);

router.post("/addSchedule", checkAdmin, schedule.addSchedule);

/////////////////////// Settings /////////////////////////

router.get("/getDefaultValues", checkUser, settings.getDefaultValues);
router.get("/getUserRights", checkUser, settings.getUserRights);
router.get("/getSelects", checkUser, settings.getSelects);
router.get("/getFences", settings.getFences);
router.get("/getGateData", settings.getGateData);

router.delete("/deleteSelect", checkSuperAdmin, settings.deleteSelect);
router.delete("/deleteFenceSettings/:_id", checkSuperAdmin, settings.deleteFenceSettings);

router.patch("/updateFenceData", checkSuperAdmin, settings.updateFenceData);
router.patch("/updateGateData", checkSuperAdmin, settings.updateGateData);

router.post("/newDefaultValue", checkSuperAdmin, settings.newDefaultValue);
router.post("/newUserRights", checkSuperAdmin, settings.newUserRights);
router.post("/newSelect", checkSuperAdmin, settings.newSelect);
router.post("/newFence", checkSuperAdmin, settings.newFence);

/////////////////////// Website settings /////////////////

router.get("/getWebsiteSettings", checkUser, websiteSettings.getWebsiteSettings);
router.get("/getGallery", websiteSettings.getGallery);

router.delete("/deleteGalleryImage", checkSuperAdmin, websiteSettings.deleteGalleryImage);

router.patch("/updateGalleryImage", checkSuperAdmin, websiteSettings.updateGalleryImage);

router.post("/newGalleryImage", checkSuperAdmin, websiteSettings.newGalleryImage);

/////////////////////// User /////////////////////////////

router.get("/getUsers", checkUser, user.getUsers);

router.patch("/updateUser", checkSuperAdmin, user.updateUser);

router.delete("/deleteUser", checkSuperAdmin, user.deleteUser);

router.patch("/updateProfile", checkUser, user.updateProfile);
router.patch("/updateUser", checkUser, user.updateUser);

/////////////////////// Uploads //////////////////////////

router.post("/uploadFiles", uploads.upload, checkUser, uploads.uploadFiles);

router.delete("/deleteFiles", checkUser, uploads.deleteFiles);

export default router;
