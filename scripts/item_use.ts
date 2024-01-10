import { world, system, EquipmentSlot, EntityEquippableComponent, EntityInventoryComponent } from "@minecraft/server";
import { playAni, on_off } from "./function";

world.beforeEvents.itemUse.subscribe(({ source, itemStack, cancel }) => {
    const iv = source.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent
    const index = 0// 추후 플래이어의 메인헨드 인덱스를 불러와 기입할것
    system.run(() => {
        if (itemStack.typeId.startsWith(`addon:`)) {
            cancel = true
        }
        console.warn(itemStack.typeId)
        switch (itemStack.typeId) {
            case "addon:headlight_off": {
                playAni(source, "")
                on_off(iv, "addon:headlight_on", index)
                break;
            }
            case "addon:headlight_on": {
                playAni(source, "")
                on_off(iv, "addon:headlight_off", index)
                break;
            }
            case "addon:horn": {
                break;
            }
            case "addon:left_signal_off": {
                playAni(source, "")
                on_off(iv, "addon:left_signal_on", index)
                break;
            }
            case "addon:left_signal_on": {
                playAni(source, "")
                on_off(iv, "addon:left_signal_off", index)
                break;
            }
            case "addon:right_signal_off": {
                playAni(source, "")
                on_off(iv, "addon:right_signal_on", index)
                break;
            }
            case "addon:right_signal_on": {
                playAni(source, "")
                on_off(iv, "addon:right_signal_off", index)
                break;
            }
            case "addon:roll_down": {
                playAni(source, "main_windows_close")
                on_off(iv, "addon:roll_up", index)
                break;
            }
            case "addon:roll_up": {
                playAni(source, "main_windows_open")
                on_off(iv, "addon:roll_down", index)
                break;
            }
        }
    })
});
