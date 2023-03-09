declare module "ZEPETO.Multiplay.Schema" {

	import { Schema, MapSchema, ArraySchema } from "@colyseus/schema"; 


	interface State extends Schema {
		players: MapSchema<Player>;
	}
	class Player extends Schema {
		sessionId: string;
		zepetoHash: string;
		zepetoUserId: string;
		transform: ZepetoTransform;
		state: number;
		subState: number;
	}
	class ZepetoTransform extends Schema {
		position: ZepetoVector3;
		rotation: ZepetoVector3;
	}
	class ZepetoVector3 extends Schema {
		x: number;
		y: number;
		z: number;
	}
}