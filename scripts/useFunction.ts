import { EntityRideableComponent, Player } from "@minecraft/server";


export function playAni(player: Player, eventName: string) {
    player.dimension.getEntities({
        type: "daewoo:tosca_gb",
        tags: [`id:${player.id}`] // 업데이트 된 코드에 따라 수정 예정
    }).forEach(f => {
        const rid = f.getComponent(`minecraft:rideable`) as EntityRideableComponent
        if (rid.getRiders()[0].id == player.id) {
            f.triggerEvent(eventName)
        }
    })
}