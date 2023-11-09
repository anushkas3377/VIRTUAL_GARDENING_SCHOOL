import {
  $query,
  $update,
  Record,
  StableBTreeMap,
  Vec,
  match,
  Result,
  nat64,
  ic,
  Opt,
  Principal,
  Option,
} from "azle";
import { v4 as uuidv4 } from "uuid";

type Garden = Record<{
  id: string;
  name: string;
  location: string;
  owner: Principal;
  plants: Vec<string>;
  image: string;
  createdAt: nat64;
  updatedAt: Opt<nat64>;
}>;

type GardenPayload = Record<{
  name: string;
  location: string;
  plants: Vec<string>;
  image: string;
}>;

const gardenStorage = new StableBTreeMap<string, Garden>(0, 44, 1024);

$update;
export function createGarden(payload: GardenPayload): Result<Garden, string> {
  if (!payload.name || !payload.location || !payload.plants || !payload.image) {
    return Result.Err<Garden, string>("Missing required fields in payload");
  }

  const garden: Garden = {
    id: uuidv4(),
    createdAt: ic.time(),
    updatedAt: Opt.None,
    owner: ic.caller(),
    name: payload.name,
    location: payload.location,
    plants: payload.plants,
    image: payload.image,
  };

  try {
    gardenStorage.insert(garden.id, garden);
    return Result.Ok<Garden, string>(garden);
  } catch (error) {
    return Result.Err<Garden, string>("Error occurred during garden insertion");
  }
}

$query;
export function getGarden(id: string): Result<Garden, string> {
  if (!id) {
    return Result.Err<Garden, string>("Invalid id.");
  }

  try {
    return match(gardenStorage.get(id), {
      Some: (g) => Result.Ok<Garden, string>(g),
      None: () => Result.Err<Garden, string>(`Garden with id=${id} not found.`),
    });
  } catch (error) {
    return Result.Err<Garden, string>(`Error while retrieving garden with id ${id}`);
  }
}

$query;
export function getAllGardens(): Result<Vec<Garden>, string> {
  try {
    return Result.Ok(gardenStorage.values());
  } catch (error) {
    return Result.Err(`Failed to get all gardens: ${error}`);
  }
}

$update;
export function updateGarden(id: string, payload: GardenPayload): Option<Garden> {
  if (!id) {
    return Option.None;
  }

  if (!payload.name || !payload.location || !payload.plants || !payload.image) {
    return Option.None;
  }

  const existingGarden = gardenStorage.get(id);
  if (existingGarden.isNone()) {
    return Option.None;
  }

  const garden = existingGarden.unwrap();
  garden.name = payload.name;
  garden.location = payload.location;
  garden.plants = payload.plants;
  garden.image = payload.image;
  garden.updatedAt = Opt.Some(ic.time());

  try {
    gardenStorage.insert(garden.id, garden);
    return Option.Some(garden);
  } catch (error) {
    return Option.None;
  }
}

$update;
export function deleteGarden(id: string): Option<Garden> {
  if (!id) {
    return Option.None;
  }

  const existingGarden = gardenStorage.get(id);
  if (existingGarden.isNone()) {
    return Option.None;
  }

  const garden = existingGarden.unwrap();
  if (garden.owner.toString() !== ic.caller.toString()) {
    return Option.None;
  }

  gardenStorage.remove(id);
  return Option.Some(garden);
}

$update;
export function addPlantToGarden(gardenId: string, plant: string): Option<Garden> {
  if (!gardenId || !plant) {
    return Option.None;
  }

  const existingGarden = gardenStorage.get(gardenId);
  if (existingGarden.isNone()) {
    return Option.None;
  }

  const garden = existingGarden.unwrap();
  if (garden.plants.includes(plant)) {
    return Option.None;
  }

  if (garden.owner.toString() !== ic.caller.toString()) {
    return Option.None;
  }

  garden.plants.push(plant);
  garden.updatedAt = Opt.Some(ic.time());

  try {
    gardenStorage.insert(garden.id, garden);
    return Option.Some(garden);
  } catch (error) {
    return Option.None;
  }
}

$update;
export function removePlantFromGarden(gardenId: string, plant: string): Option<Garden> {
  if (!gardenId || !plant) {
    return Option.None;
  }

  const existingGarden = gardenStorage.get(gardenId);
  if (existingGarden.isNone()) {
    return Option.None;
  }

  const garden = existingGarden.unwrap();
  if (!garden.plants.includes(plant)) {
    return Option.None;
  }

  if (garden.owner.toString() !== ic.caller.toString()) {
    return Option.None;
  }

  const plantIndex = garden.plants.indexOf(plant);
  garden.plants.splice(plantIndex, 1);
  garden.updatedAt = Opt.Some(ic.time());

  try {
    gardenStorage.insert(garden.id, garden);
    return Option.Some(garden);
  } catch (error) {
    return Option.None;
  }
}

$query;
export function listPlantsInGarden(gardenId: string): Result<Vec<string>, string> {
  if (!gardenId) {
    return Result.Err<Vec<string>, string>("Invalid gardenId.");
  }

  try {
    return match(gardenStorage.get(gardenId), {
      Some: (garden) => Result.Ok<Vec<string>, string>(garden.plants),
      None: () => Result.Err<Vec<string>, string>(`Garden with id=${gardenId} not found.`),
    });
  } catch (error) {
    return Result.Err<Vec<string>, string>(`Error while listing plants in garden with id ${gardenId}`);
  }
}

$update;
export function updateGardenImage(gardenId: string, newImage: string): Option<Garden> {
  if (!gardenId) {
    return Option.None;
  }

  const existingGarden = gardenStorage.get(gardenId);
  if (existingGarden.isNone()) {
    return Option.None;
  }

  const garden = existingGarden.unwrap();
  garden.image = newImage;
  garden.updatedAt = Opt.Some(ic.time());

  try {
    gardenStorage.insert(garden.id, garden);
    return Option.Some(garden);
  } catch (error) {
    return Option.None;
  }
}
