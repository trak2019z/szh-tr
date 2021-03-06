﻿using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using szh.cultivation;
using szh.cultivation.plants;
using szh.measurement;

namespace api.Controllers {
    [Route("api/[controller]")]
    public class DbDataController : Controller {

        private void ClearDataBase() {

            foreach (Tunnel tunnel in Tunnel.GetTunnels()) {

                foreach (Cultivation cultivation in Cultivation.GetCultivationsInTunnel(tunnel.id)) {
                    CultivationComment.DeleteFromBreeding(cultivation.id);
                    Cultivation.DeleteFromTunnel(cultivation.id);
                }

                foreach (AvrDevice avr_device in AvrDevice.GetAvrDevicesInTunnel(tunnel.id)) {
                    Measurement.DeleteMeasurements();
                    AvrDevice.DeleteAvrDevice(avr_device.id);
                }

                Tunnel.DeleteTunnel(tunnel.id);
            }

            Plant.DeletePlants();
        }

        [HttpPut("{prepare}")]
        public IActionResult PrepareDataBase(bool prepare) {

            ClearDataBase();

            if (prepare) {
                Random gen = new Random();

                List<string> plantsNames = new List<string>();
                plantsNames.Add("Awokado");
                plantsNames.Add("Lychee");
                plantsNames.Add("Cytryna");
                plantsNames.Add("Pomarańcza");
                plantsNames.Add("Mango");

                foreach (string plantName in plantsNames) {
                    int newPlantId = Plant.CreatePlant(plantName).id;

                    for (int i = 0; i < 5; i++) {
                        Variety.CreateVariety(PlantSpecies.GetPlantSpeciesByName(plantName).id, $"Odmiana {i}");
                    }
                }

                for (int i = 0; i < 4; i++) {
                    int id = Tunnel.CreateTunnel($"Tunnel {i}").id;
                    AvrDevice.CreateAvrDevice($"localhost/espSim/{i + 10}", id);

                    for (int j = 0; j < gen.Next(1, 6); j++) {

                        List<Plant> plants = Plant.GetPlants();
                        int plantTableIndex = gen.Next(0, plants.Count - 1);


                        int breedingId = Cultivation.CreateCultivation($"Hodowla {i}/{j}", plants[plantTableIndex].id, i + i * j + 1, id, DateTime.Now).id;
                        for (int k = 0; k < gen.Next(0, 10); k++) {
                            CultivationComment.AddCultivationComents($"Komentarz do hodowli { i + i * j * k}", breedingId);
                        }
                    }
                }
            }

            return new NoContentResult();
        }

    }
}
