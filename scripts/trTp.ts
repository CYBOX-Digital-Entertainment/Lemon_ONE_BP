import { world } from "@minecraft/server"
import { EntityData } from "./class"
function tpTr(data:EntityData) {
    const tr = world.getEntity(data.trid)
    const ent = world.getEntity(data.entid)
    let loc = ent?.location
    if (loc == undefined) return
    if (!data.tropen) {
        loc.y += 100
    }
    tr?.runCommandAsync(`tp ${loc?.x} ${loc?.y} ${loc?.z}`)
}