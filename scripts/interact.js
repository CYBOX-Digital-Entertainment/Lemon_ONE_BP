import { world } from "@minecraft/server";
import { readData } from "./db";
import { openui, openui2 } from "./function";
world.beforeEvents.playerInteractWithEntity.subscribe(e => {
    const { itemStack, player, target } = e;
    if (target.typeId != "daewoo:tosca_gb")
        return;
    const rid = target.getComponent(`minecraft:rideable`);
    const data = readData(target.id);
    if (itemStack?.typeId.startsWith(`addon:`) || (!data.ride && itemStack?.getLore()[0]?.slice(14) != target.id)) {
        e.cancel = true;
        console.warn(`cancel`);
        return;
    }
    if (itemStack?.typeId == "key:key" && itemStack?.getLore()[0].slice(14) == target.id) {
        e.cancel = true;
        console.warn(!data.ride);
        if (rid.getRiders()[0]?.id == player.id || rid.getRiders()[0]?.id == data.plid || data.ride) {
            openui2(player, data);
        }
        else {
            openui(player, data);
        }
    }
});
