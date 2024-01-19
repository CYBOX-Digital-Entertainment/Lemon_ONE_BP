import { world } from "@minecraft/server";
export class EntityData {
    constructor(data = undefined) {
        if (data != undefined) {
            this.entid = data.entid;
            this.plid = data.plid;
            this.trid = data.trid;
            this.tropen = data.tropen;
            this.ride = data.ride;
        }
        else {
            this.entid = "";
            this.plid = "";
            this.trid = "";
            this.tropen = false;
            this.ride = false;
        }
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
