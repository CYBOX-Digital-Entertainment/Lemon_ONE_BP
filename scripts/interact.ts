import { EntityRideableComponent, world } from "@minecraft/server";
import { readData } from "./db"
import { openui, openui2 } from "./function"
import { EntityData } from "./class"

world.beforeEvents.playerInteractWithEntity.subscribe(e => {
    const { itemStack, player, target } = e
    if (target.typeId != "cybox:dw_tosca") return;
    const rid = target.getComponent(`minecraft:rideable`) as EntityRideableComponent
    const data = readData(target.id) as EntityData
    if (itemStack?.typeId.startsWith(`addon:`) || (!data.ride && itemStack?.getLore()[0]?.slice(14) != target.id)) {
        e.cancel = true
        console.warn(`cancel`)
        return

    }
    if (itemStack?.typeId == "key:dw_tosca_key" && itemStack?.getLore()[0].slice(14) == target.id) {
        e.cancel = true
        console.warn(!data.ride)
        if (rid.getRiders()[0]?.id == player.id || rid.getRiders()[0]?.id == data.plid || data.ride) {
            openui2(player, data)
        } else {
            openui(player, data)
        }
    }
})