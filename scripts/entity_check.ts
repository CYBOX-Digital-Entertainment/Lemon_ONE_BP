 import { Player, world } from "@minecraft/server"
 
 export function entity_check(pl: Player[]){
    pl.forEach(pl=>{
        pl.getTags().filter(f=>f.startsWith(`id:`)).forEach(f=>{
            if(world.getEntity(f.slice(3)) == undefined) pl.removeTag(f)
        })
    })
 }