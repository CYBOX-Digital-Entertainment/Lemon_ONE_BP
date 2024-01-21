import { world } from "@minecraft/server";
export class EntityData {
    constructor(data = undefined) {
        this.entid = data?.entid ?? "";
        this.plid = data?.plid ?? "";
        this.trid = data?.trid ?? "";
        this.tropen = data?.tropen ?? false;
        this.ride = data?.ride ?? false;
    }
    setPlid(id) {
        this.plid = id;
        return this;
    }
    setTrOpen(open) {
        this.tropen = open;
        return this;
    }
    setEntId(id) {
        this.entid = id;
        return this;
    }
    setTrId(id) {
        this.trid = id;
        return this;
    }
    setRide(ride) {
        this.ride = ride;
        return this;
    }
    entity() {
        return world.getEntity(this.entid);
    }
}