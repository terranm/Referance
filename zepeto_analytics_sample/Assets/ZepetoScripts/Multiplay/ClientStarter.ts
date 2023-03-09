import { CharacterJumpState, CharacterState, SpawnInfo, ZepetoPlayer, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { Room, RoomData } from 'ZEPETO.Multiplay';
import * as UnityEngine from "UnityEngine";
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';
import { Player, State, ZepetoVector3 } from 'ZEPETO.Multiplay.Schema';
import CameraManager from '../Managers/CameraManager';

export default class ClientStarter extends ZepetoScriptBehaviour {

    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Singleton
    private static _instance: ClientStarter;
    public static get instance(): ClientStarter { return ClientStarter._instance; }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Singleton END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property
    public multiplay: ZepetoWorldMultiplay;

    private room: Room
    public get clientRoom(): Room
    {
        return this.room
    }
    private currentPlayers: Map<string, Player> = new Map<string, Player>();
    private player : Player;
    private cam : UnityEngine.Camera;
    private spawnPoint: UnityEngine.Transform;

    private playerCur : CharacterState;

    private dontPlayMotion:boolean;
    private _isCoroutinePlaying: boolean
    public get isCoroutinePlaying(): boolean { return this._isCoroutinePlaying }
    public set isCoroutinePlaying(value: boolean) { this._isCoroutinePlaying = value }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting
    Awake()
    {
        ClientStarter._instance = this;
    }

    private Start() {

        const spawnObject = UnityEngine.GameObject.FindWithTag("SpawnPoint");
        if(spawnObject != null)
            this.spawnPoint = spawnObject.transform;

        this.multiplay.RoomCreated += (room: Room) => {
            this.room = room;
        };

        this.multiplay.RoomJoined += (room: Room) => {
            room.OnStateChange += this.OnStateChange;
        };

        this.StartCoroutine(this.SendMessageLoop(0.1));                                                   // To Player Transform Send
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Player Transform Send
    // Send the local character transform to the server at the scheduled Interval Time.
    private * SendMessageLoop(tick: number) {
        while (true) {
            yield new UnityEngine.WaitForSeconds(tick);

            if (this.room != null && this.room.IsConnected) {
                const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.room.SessionId);                 // Send Player Transform
                if (hasPlayer) {
                    const myPlayer = ZepetoPlayers.instance.GetPlayer(this.room.SessionId);
                    // if (myPlayer.character.CurrentState != CharacterState.Idle)
                        this.SendTransform(myPlayer.character.transform);
                }
            }
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Player Transform Send END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Main
    private OnStateChange(state: State, isFirst: boolean) {

        // When the first OnStateChange event is received, a full state snapshot is recorded.
        if (isFirst) {

            // [CharacterController] (Local) Called when the Player instance is fully loaded in Scene
            ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
                const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;

                myPlayer.character.gameObject.tag = "Player";                                           // "Player" tag 추가
                myPlayer.character.OnChangedState.AddListener((cur, prev) => {
                    this.SendState(cur);                                                                // ex) Jump, Idle......
                    // console.log(`cur : ${cur}`);
                });
            });

            // [CharacterController] Called when the Player instance is fully loaded in Scene
            ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId: string) => {
                const player: Player = this.currentPlayers.get(sessionId);
                const isLocal = this.room.SessionId === sessionId;
                if (!isLocal)
                {
                    this.player = player;
                    // [RoomState] Called whenever the state of the player instance is updated. 
                    player.OnChange += (changeValues) => this.OnUpdatePlayer(sessionId, player);
                }
            });
        }

        let join = new Map<string, Player>();
        let leave = new Map<string, Player>(this.currentPlayers);

        state.players.ForEach((sessionId: string, player: Player) => {
            if (!this.currentPlayers.has(sessionId))
            {
                join.set(sessionId, player);
            }
            leave.delete(sessionId);
        });

        // [RoomState] Create a player instance for players that enter the Room
        join.forEach((player: Player, sessionId: string) => this.OnJoinPlayer(sessionId, player));

        // [RoomState] Remove the player instance for players that exit the room
        leave.forEach((player: Player, sessionId: string) => this.OnLeavePlayer(sessionId, player));
    }

    private OnJoinPlayer(sessionId: string, player: Player) {
        console.log(`[OnJoinPlayer] players - sessionId : ${sessionId}`);
        this.currentPlayers.set(sessionId, player);

        const spawnInfo = new SpawnInfo();
        const position = this.ParseVector3(player.transform.position);
        const rotation = this.ParseVector3(player.transform.rotation);
        spawnInfo.position = position;
        spawnInfo.rotation = UnityEngine.Quaternion.Euler(rotation);

        if(this.spawnPoint != null)
        {
            spawnInfo.position = this.spawnPoint.position;
            spawnInfo.rotation = this.spawnPoint.rotation;
        }

        const isLocal = this.room.SessionId === player.sessionId;
        if(isLocal)
        {
            this.player = player;                                                                        // status 적용을 위해 Player 초기화
        }

        ZepetoPlayers.instance.CreatePlayerWithUserId(sessionId, player.zepetoUserId, spawnInfo, isLocal);

        this.cam = ZepetoPlayers.instance.ZepetoCamera.camera;                                           // Camera에 Manager 추가
        if(this.cam.gameObject.GetComponent<CameraManager>() == null)
        {
            let camManager : CameraManager = this.cam.gameObject.AddComponent<CameraManager>();
            camManager.multiplay = this.multiplay;
        }
    }

    private OnLeavePlayer(sessionId: string, player: Player)
    {
        console.log(`[OnRemove] players - sessionId : ${sessionId}`);
        this.currentPlayers.delete(sessionId);

        ZepetoPlayers.instance.RemovePlayer(sessionId);
    }

    private OnUpdatePlayer(sessionId: string, player: Player)
    {

        const position = this.ParseVector3(player.transform.position);
        const rotation = this.ParseVector3(player.transform.rotation);

        const hasPlayer = ZepetoPlayers.instance.HasPlayer(sessionId);
        if (!hasPlayer)
        {
            console.error(` ========================================== sessionId ${sessionId} `);
            return;
        }
        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
        
        // other player의 보이는 거리와 실제 거리를 비교
        let distance = UnityEngine.Vector3.Distance(position, zepetoPlayer.character.transform.position);
        if(distance > 3 || this.dontPlayMotion)                                                     // Teleport
        {
            zepetoPlayer.character.transform.position = position;
            zepetoPlayer.character.transform.rotation = UnityEngine.Quaternion.Euler(rotation);
        }
        else                                                                                        // Player Move
        {
            zepetoPlayer.character.MoveToPosition(position);
        }

        if (player.state === CharacterState.Jump) {                                                 // Player Jump
            if (zepetoPlayer.character.CurrentState !== CharacterState.Jump) {
                zepetoPlayer.character.Jump();
            }

            if (player.subState === CharacterJumpState.JumpDouble) {
                zepetoPlayer.character.DoubleJump();
            }
        }
    }

    private ParseVector3(vector3: ZepetoVector3): UnityEngine.Vector3 {
        return new UnityEngine.Vector3
        (
            vector3.x,
            vector3.y,
            vector3.z
        );
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Main END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Server Send
    private SendState(state: CharacterState)                // player state
    {
        const data = new RoomData();
        data.Add("state", state);
        this.room.Send("onChangedState", data.GetObject());
    }
    private SendTransform(transform: UnityEngine.Transform) // player transform
    {
        const data = new RoomData();

        const pos = new RoomData();
        pos.Add("x", transform.position.x);
        pos.Add("y", transform.position.y);
        pos.Add("z", transform.position.z);
        data.Add("position", pos.GetObject());

        const rot = new RoomData();
        rot.Add("x", transform.eulerAngles.x);
        rot.Add("y", transform.eulerAngles.y);
        rot.Add("z", transform.eulerAngles.z);
        data.Add("rotation", rot.GetObject());

        this.room.Send("onChangedTransform", data.GetObject());
    }
    public SendRoomServerLog(message : string)             // test log
    {
        this.room.Send("SL", message);
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Server Send END
}