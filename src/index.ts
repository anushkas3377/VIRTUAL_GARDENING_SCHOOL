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
  plants:Vec<string>; 
  image: string;
}>;


 const gardenStorage = new StableBTreeMap<string, Garden>(0, 44, 1024);


    $update;
export function createGarden(payload: GardenPayload): Result<Garden, string> {
  const garden: Garden = {
    id: uuidv4(),
    createdAt: ic.time(),
    updatedAt: Opt.None,
          owner: ic.caller(),
    ...payload,
  };

  gardenStorage.insert(garden.id, garden);
  return Result.Ok<Garden, string>(garden);
}

  

$query;
export function getGarden(id: string): Result<Garden, string> {
  return match(gardenStorage.get(id), {
    Some: (g) => Result.Ok<Garden, string>(g),
    None: () => Result.Err<Garden, string>(`Garden with id=${id} not found.`),
  });
}

   $query;
   export function getAllGardens(): Result<Vec<Garden>, string> {
  return Result.Ok(gardenStorage.values());
}



$update;
export function updateGarden(id: string, payload: GardenPayload): Result<Garden, string> {
  return match(gardenStorage.get(id), {
    Some: (existingGarden) => {
      const updatedGarden: Garden = {
        ...existingGarden,
        ...payload,
        updatedAt: Opt.Some(ic.time()),
      };

      gardenStorage.insert(updatedGarden.id, updatedGarden);
      return Result.Ok<Garden, string>(updatedGarden);
    },
    None: () => Result.Err<Garden, string>(`Garden with id=${id} not found.`),
  });
}

 

$update;
export function deleteGarden(id: string): Result<Garden, string> {
  return match(gardenStorage.get(id), {
    Some: (existingGarden) => {
      gardenStorage.remove(id);
      return Result.Ok<Garden, string>(existingGarden);
    },
    None: () => Result.Err<Garden, string>(`Garden with id=${id} not found.`),
  });
}

$update;
export function addPlantToGarden(gardenId: string, plant: string): Result<Garden, string> {
  return match(gardenStorage.get(gardenId), {
    Some: (garden) => {
      if (!garden.plants.includes(plant)) {
        garden.plants.push(plant);
        garden.updatedAt = Opt.Some(ic.time());
        gardenStorage.insert(garden.id, garden);
        return Result.Ok<Garden, string>(garden);
      } else {
        return Result.Err<Garden, string>(`Plant '${plant}' is already in the garden.`);
      }
    },
    None: () => Result.Err<Garden, string>(`Garden with id=${gardenId} not found.`),
  });
}

$update;
export function removePlantFromGarden(gardenId: string, plant: string): Result<Garden, string> {
  return match(gardenStorage.get(gardenId), {
    Some: (garden) => {
      const plantIndex = garden.plants.indexOf(plant);
      if (plantIndex !== -1) {
        garden.plants.splice(plantIndex, 1);
        garden.updatedAt = Opt.Some(ic.time());
        gardenStorage.insert(garden.id, garden);
        return Result.Ok<Garden, string>(garden);
      } else {
        return Result.Err<Garden, string>(`Plant '${plant}' is not in the garden.`);
      }
    },
    None: () => Result.Err<Garden, string>(`Garden with id=${gardenId} not found.`),
  });
}

$query;
export function listPlantsInGarden(gardenId: string): Result<Vec<string>, string> {
  return match(gardenStorage.get(gardenId), {
    Some: (garden) => Result.Ok<Vec<string>, string>(garden.plants),
    None: () => Result.Err<Vec<string>, string>(`Garden with id=${gardenId} not found.`),
  });
}

$update;
export function updateGardenImage(gardenId: string, newImage: string): Result<Garden, string> {
  return match(gardenStorage.get(gardenId), {
    Some: (garden) => {
      garden.image = newImage;
      garden.updatedAt = Opt.Some(ic.time());
      gardenStorage.insert(garden.id, garden);
      return Result.Ok<Garden, string>(garden);
    },
    None: () => Result.Err<Garden, string>(`Garden with id=${gardenId} not found.`),
  });
}



globalThis.crypto = {
  //@ts-ignore
  getRandomValues: () => {
    let array = new Uint8Array(32);

    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }

    return array;
  },
};
