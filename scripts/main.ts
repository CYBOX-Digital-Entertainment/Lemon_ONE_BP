import { Entity, world, ItemStack } from "@minecraft/server"
import "./interact"
import { readData, saveData } from "./db"
import { EntityData } from "./class"

world.afterEvents.entitySpawn.subscribe(({entity})=>{
    if (readData(entity.id) == undefined && entity.typeId == "daewoo:tosca_gb") {
        const dimension = entity.dimension
        const tr = entity.dimension.spawnEntity(`addon:tr`, entity.location)
        const itemStack = new ItemStack(`key:key`, 1)
        itemStack.setLore([`등록된 자동차 아이디 : ${entity.id}`])
        entity.dimension.spawnItem(itemStack, entity.location)
        const data = new EntityData()
        data.setTrId(tr.id)
        data.setEntId(entity.id)
        saveData(entity.id, data)
        world.sendMessage(JSON.stringify(data))
    }
})