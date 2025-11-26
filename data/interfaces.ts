import { Types } from "mongoose";

export interface Response {
  success: boolean;
  data: Project[];
  message: string;
}

export interface Calculations {
  client: Client;
  fences: Fence[];
  retail: boolean;
}

export interface Project {
  _id?: Types.ObjectId;
  creator: Creator;
  client: Client;
  retail: boolean;
  fenceMeasures: Fence[];
  results: Result[];
  works: Works[];
  gates: Gate[];
  totalPrice: number;
  totalCost: number;
  totalProfit: number;
  totalMargin: number;
  priceVAT: number;
  priceWithDiscount: number;
  discount: boolean;
  status: string;
  advance: number;
  orderNumber: string;
  files: string[];
  comments: Comment[];
  versions: Version[];
  dates: Dates;
  workers: string[];
}
export interface Version {
  _id?: Types.ObjectId;
  id: Types.ObjectId;
  date: string;
}

export interface Dates {
  dateCreated: string;
  dateExparation: string;
  dateConfirmed: string;
  dateCompletion: string;
  dateArchieved: string;
}

export interface Client {
  _id?: string;
  address: string;
  username: string;
  phone: string;
  email: string;
}

export interface Fence {
  id: string;
  side: string;
  name: string;
  color: string;
  material: string;
  manufacturer: string;
  services: string;
  seeThrough: string;
  direction: string;
  holes: string;
  parts: string;
  comment: string;
  twoSided: string;
  bindings: string;
  anchoredPoles: string;
  space: number;
  elements: number;
  totalLength: number;
  totalQuantity: number;
  measures: Measure[];
}

export interface Measure {
  length: number;
  height: number;
  MeasureSpace: number;
  elements: number;
  gates: GateInfo;
  kampas: {
    exist: boolean;
    value: number;
    comment: string;
  };
  laiptas: {
    exist: boolean;
    value: number;
    direction: string;
  };
}

export interface Result {
  id: string;
  name: string;
  price: number;
  cost: number;
  category: string;
  quantity: number;
  height: number;
  twoSided: string;
  direction: string;
  seeThrough: string;
  space: number;
  color: string;
  totalPrice: number;
  totalCost: number;
  profit: number;
  margin: number;
  width: number | null;
  delivered: boolean;
  ordered: boolean;
  retail: boolean;
  units: boolean;
}

export interface InstallationResult {
  name: string;
  category: string;
  quantity: number;
  height: number;
  twoSided: string;
  direction: string;
  seeThrough: string;
  space: number;
  color: string;
  width: number | null;
  delivered: boolean;
}

export interface OtherParts {
  color: string;
  quantity: number;
  height: number;
  name?: string;
}

export interface RetailLegs {
  color: string;
  quantity: number;
  height: number;
  name: string;
}
export interface Fences {
  name: string;
  color: string;
  length: number;
  height: number;
  quantity: number;
  elements: number;
  material: string;
  space: number;
  seeThrough: string;
  direction: string;
  twoSided: string;
}

export interface Gate {
  _id: Types.ObjectId;
  name: string;
  auto: string;
  width: number;
  height: number;
  color: string;
  filling: string;
  ready: boolean;
  bankette: string;
  direction: string;
  lock: string;
  comment: string;
  option: string;
}

export interface GateSchema {
  _id: Types.ObjectId;
  measure: string;
  client: Client;
  orderNr: string;
  comments: Comment[];
  creator: Creator;
  manager: string;
  gates: Gate[];
  dateCreated: string;
}

export interface Creator {
  username: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface GateInfo {
  exist: boolean;
  name: string;
  automatics: string;
  comment: string;
  direction: string;
  lock: string;
  bankette: string;
  option: string;
}

export interface User {
  _id: Types.ObjectId;
  email: string;
  password: string;
  username: string;
  lastName: string;
  phone: string;
  verified: boolean;
  accountType: string;
  photo: string;
}

export interface ResponseUser {
  success: boolean;
  data: User;
  message: string;
}
export interface ResponseUsers {
  success: boolean;
  data: User[];
  message: string;
}

export interface ProjectsState {
  projects: Project[];
  filteredProjects: Project[];
  selectedProject: string | null;
  selectedFilter: string;
  selectedStatusFilter: string;
}

export interface ArchivesState {
  archives: Project[];
  filteredArchives: Project[];
  backup: Project[];
  filteredBackup: Project[];
  deleted: Project[];
  filteredDeleted: Project[];
  unconfirmed: Project[];
  filteredUnconfirmed: Project[];
  projectToOpen: Project | null;
}

export interface Product {
  _id: Types.ObjectId;
  name: string;
  prices: SeeThroughPrice;
  category: string;
}

export interface SeeThrough {
  Aklina: SeeThroughOptions;
  Nepramatoma: SeeThroughOptions;
  Vidutiniška: SeeThroughOptions;
  Pramatoma: SeeThroughOptions;
  "25% Pramatomumas": SeeThroughOptions;
  "50% Pramatomumas": SeeThroughOptions;
}

export interface SeeThroughOptions {
  space: number;
  price: number;
  cost: number;
}

export interface Works {
  id: string;
  name: string;
  quantity: number;
  price: number;
  cost: number;
  totalCost: number;
  totalPrice: number;
  margin: number;
  profit: number;
  done: boolean;
  retail: boolean;
}

export interface Supplier {
  _id?: string;
  address: string;
  username: string;
  phone: string;
  email: string;
}

export interface InstallationWorks {
  name: string;
  quantity: number;
  delivered: boolean;
}

export interface ResponseProducts {
  success: boolean;
  data: Product[];
  message: string;
}
export interface ResponseProduct {
  success: boolean;
  data: Product;
  message: string;
}

export interface ResponseProject {
  success: boolean;
  data: Project;
  message: string;
}

export interface MenuLinks {
  name: string;
  link: string;
  iconPath: string;
}

export interface Bonus {
  address: string;
  dateFinished: string;
  price: number;
  cost: number;
  profit: number;
  margin: number;
  user: string;
}

export interface FenceMeasure {
  name: string;
  height: number;
  width: number;
  seeThrough: number[];
}

export interface Installation {
  _id: Types.ObjectId;
  client: Client;
  creator: Creator;
  orderNumber: string;
  workers: string[];
  status: string;
  fences: ProdutionFence[];
  results: InstallationResult[];
  works: InstallationWorks[];
  comments: Comment[];
  files: string[];
}

export interface InstallationMeasure {
  length: number;
  height: number;
  MeasureSpace: number;
  elements: number;
  gates: GateInfo;
  done: number | undefined;
  postone: boolean;
  kampas: {
    exist: boolean;
    value: number;
    comment: string;
  };
  laiptas: {
    exist: boolean;
    value: number;
    direction: string;
  };
}

export interface Prodution {
  _id: Types.ObjectId;
  client: Client;
  creator: Creator;
  orderNumber: string;
  status: string;
  fences: ProdutionFence[];
  bindings: Bindings[] | null;
  comments: Comment[];
  files: string[];
}

export interface InstallationFence {
  id: string;
  side: string;
  name: string;
  color: string;
  material: string;
  manufacturer: string;
  services: string;
  seeThrough: string;
  direction: string;
  holes: string;
  parts: string;
  comment: string;
  twoSided: string;
  bindings: string;
  anchoredPoles: string;
  space: number;
  elements: number;
  totalLength: number;
  totalQuantity: number;
  measures: InstallationMeasure[];
}

export interface ProdutionFence {
  id: string;
  side: string;
  name: string;
  color: string;
  material: string;
  manufacturer: string;
  services: string;
  seeThrough: string;
  direction: string;
  holes: string;
  parts: string;
  comment: string;
  twoSided: string;
  bindings: string;
  anchoredPoles: string;
  space: number;
  elements: number;
  totalLength: number;
  totalQuantity: number;
  measures: ProdutionMeasure[];
}

export interface ProdutionMeasure {
  length: number;
  height: number;
  MeasureSpace: number;
  elements: number;
  gates: GateInfo;
  cut: number | undefined;
  done: number | undefined;
  postone: boolean;
  kampas: {
    exist: boolean;
    value: number;
    comment: string;
  };
  laiptas: {
    exist: boolean;
    value: number;
    direction: string;
  };
}

export interface Comment {
  date: string;
  creator: string;
  comment: string;
}

export interface Bindings {
  id: string;
  color: string | undefined;
  height: number | undefined;
  name: string | undefined;
  quantity: number | undefined;
  cut: number | undefined;
  done: number | undefined;
  postone: boolean;
}

export interface BindingItem {
  bindings: boolean;
  color: string;
  firstHeight: Measure;
  lastHeight: Measure;
}

export interface Worker {
  _id: Types.ObjectId;
  lastName: string;
}

export interface Job {
  _id: Types.ObjectId;
  address: string;
}

export interface Schedule {
  _id: Types.ObjectId;
  date: string;
  worker: Worker;
  jobs: [Job] | [];
  comment: string;
}

export interface SelectValues {
  fenceMaterials: string[];
  fenceManufacturers: string[];
  gateOption: string[];
  gateLock: string[];
  gateTypes: string[];
  fenceColors: string[];
  fenceTypes: string[];
  retailFenceTypes: string[];
  status: string[];
  accountTypes: string[];
}

export interface DefaultValues {
  poleMain: string;
  poleAlt: string;
  gatePoleMain: string;
  gatePoleAlt: string;
  border: string;
  borderHolder: string;
  crossbar: string;
  crossbarHolders: string;
  rivets: string;
  bolts: string;
  bindings: string;
  retailBindings: string;
  retailDoubleLeg: string;
  retailSingleLeg: string;
  retailBindingsEco: string;
  retailDoubleLegEco: string;
  retailSingleLegEco: string;
  segmentHolders: string;
  gates: string;
  gates2: string;
  gatesAuto: string;
  gates2Auto: string;
  smallGates: string;
  smallGates2: string;
  smallGatesSegment: string;
  segmentGatesWork: string;
  segmentGateWork: string;
  gateSegment: string;
  polesWork: string;
  gatesPoleWork: string;
  gateBnkette: string;
  bordersWork: string;
  transport: string;
  fenceWork: string;
  holesWork: string;
  totalFencesWithBindings: string;
  bindingWork: string;
  fenceboardWork: string;
  crossbarWork: string;
  segmentWork: string;
  anchoredPoleMain: string;
  anchoredPoleAlt: string;
  anchoredPolesWork: string;
  anchoredGatePoleMain: string;
  anchoredGatePoleAlt: string;
  anchoredGatePolesWork: string;
  dileCork: string;
}

export interface UserRights {
  accountType: string;
  project: boolean;
  schedule: boolean;
  production: boolean;
  installation: boolean;
  gate: boolean;
  orders: boolean;
  admin: boolean;
  warehouse: boolean;
}

export interface Order {
  _id?: string;
  projectID: string;
  creator: Creator;
  client: Client;
  data: [OrderData];
  orderDate: string;
  deliveryDate: string;
  deliveryMethod: string;
  comments: Comment[];
  recipient: string;
  status: boolean;
  orderNr: string;
}

export interface OrderData {
  name: string;
  color: string;
  quantity: number;
  measureIndex: number;
  ordered: boolean;
  inWarehouse: boolean;
  delivered: boolean;
}

export interface PotentialClient {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  comment: string;
  send: boolean;
}

export interface FenceDetails {
  width: number;
  height: number;
  bends: number;
  holes: number;
}

export interface SeeThroughSteps {
  aklina: number;
  nepramatoma: number;
  vidutiniska: number;
  pramatoma: number;
  pramatoma25: number;
  pramatoma50: number;
}

export interface SeeThroughPrice {
  cost: number;
  priceRetail: number;
  priceWholesale: number;
}

export interface QualityPricing {
  meter: SeeThroughPrice;
  aklina: SeeThroughPrice;
  nepramatoma: SeeThroughPrice;
  vidutiniska: SeeThroughPrice;
  pramatoma: SeeThroughPrice;
  pramatoma25: SeeThroughPrice;
  pramatoma50: SeeThroughPrice;
}

export interface PriceTier {
  premium: QualityPricing;
  eco: QualityPricing;
  cost: number;
  priceRetail: number;
  priceWholesale: number;
}

export interface profitPercents {
  premiumRetail: number;
  premiumWholesale: number;
  ecoRetail: number;
  ecoWholesale: number;
}

export interface FenceSetup {
  _id: Types.ObjectId;
  name: string;
  category: string;
  defaultDirection: string;
  details: FenceDetails;
  steps: SeeThroughSteps;
  prices: PriceTier;
  profit: profitPercents;
}
