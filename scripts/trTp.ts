import { Entity, world } from "@minecraft/server";

//트렁크를 순간이동 시키기 위한 함수
export function trTp(ent: Entity[]) {
    for (const entity of ent.filter(f => f.typeId == "addon:tr")) {
        if (entity.getTags().find(f => f.startsWith(`id:`)) == undefined) continue;
        let ent = world.getEntity(entity.getTags().find(f => f.startsWith(`id:`))?.slice(3) ?? "")
        
        if (entity.hasTag("trunkclose")) {
            ent?.runCommandAsync(`tp @e[tag=id:${ent.id}, type=!player] ~~100~`)
        } else if (entity.hasTag("trunkopen")) {
            ent?.runCommandAsync(`tp @e[tag=id:${ent.id}, type=!player] ^^^-3`)
        }
    }
}
