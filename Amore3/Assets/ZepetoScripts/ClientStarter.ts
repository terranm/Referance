import {ZepetoScriptBehaviour} from 'ZEPETO.Script'
import {ZepetoWorldMultiplay} from 'ZEPETO.World'
import {Room, RoomData} from 'ZEPETO.Multiplay'
import {Player, State, Vector3} from 'ZEPETO.Multiplay.Schema'
import { CharacterState, SpawnInfo, ZepetoPlayers, ZepetoPlayer, ZepetoCharacter} from 'ZEPETO.Character.Controller'
import * as UnityEngine from "UnityEngine";
import { Rigidbody } from 'UnityEngine'


export default class Starter extends ZepetoScriptBehaviour {

    public multiplay: ZepetoWorldMultiplay;

    private room: Room;
    private currentPlayers: Map<string, Player> = new Map<string, Player>();
    public playerObj: UnityEngine.GameObject;
    public startPoint: UnityEngine.Transform;
    //public fireWork: UnityEngine.GameObject;

    isfireWork: boolean;
    public gestureClips: UnityEngine.AnimationClip[];
    gestureNum: number;
    SessionId: string;

    private Start() {

        this.multiplay.RoomCreated += (room: Room) => {
            this.room = room;
        };

        this.multiplay.RoomJoined += (room: Room) => {
            room.OnStateChange += this.OnStateChange;

            room.AddMessageHandler("GestureNum", (message: number) =>
            {
                this.gestureNum = message;
            });

            room.AddMessageHandler("Gesture", (message: string) =>
            {
                // print server message
                let _sessionId = message;
                _sessionId = _sessionId.toString();
                console.log(typeof (_sessionId));
                console.log(typeof (this.SessionId));
                let _character = ZepetoPlayers.instance.GetPlayer(_sessionId);

                let Character = _character.character;
                Character.SetGesture(this.gestureClips[this.gestureNum]);
                this.StartCoroutine(this.StopCharacterGesture(this.gestureClips[this.gestureNum].length - 0.3, Character));
            });
        };


       /* this.fireWork = UnityEngine.GameObject.Instantiate(this.fireWork, UnityEngine.Vector3.zero, UnityEngine.Quaternion.identity) as UnityEngine.GameObject;
        this.fireWork.SetActive(false);*/
        this.StartCoroutine(this.SendMessageLoop(0.1));
        
    }

    // 일정 Interval Time으로 내(local)캐릭터 transform을 server로 전송합니다.
    private* SendMessageLoop(tick: number) {
        while (true) {
            yield new UnityEngine.WaitForSeconds(tick);

            if (this.room != null && this.room.IsConnected) {
                const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.room.SessionId);
                if (hasPlayer) {
                    const myPlayer = ZepetoPlayers.instance.GetPlayer(this.room.SessionId);
                    if (myPlayer.character.CurrentState != CharacterState.Idle)
                        this.SendTransform(myPlayer.character.transform);
                }
            }
        }
    }

    private OnStateChange(state: State, isFirst: boolean) {

        // 첫 OnStateChange 이벤트 수신 시, State 전체 스냅샷을 수신합니다.
        if (isFirst) {

            // [CharacterController] (Local)Player 인스턴스가 Scene에 완전히 로드되었을 때 호출
            ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
                const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;
                this.playerObj.transform.parent = myPlayer.character.transform;
                myPlayer.character.OnChangedState.AddListener((cur, next) => {
                    this.SendState(next);
                });
            });

            // [CharacterController] Player 인스턴스가 Scene에 완전히 로드되었을 때 호출
            ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId: string) => {
                const isLocal = this.room.SessionId === sessionId;
                if (!isLocal) {
                    const player: Player = this.currentPlayers.get(sessionId);
                    const otherPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
                    let capcol = otherPlayer.character.gameObject.AddComponent<UnityEngine.CapsuleCollider>();
                    capcol.center = new UnityEngine.Vector3(0, 0.6, 0);
                    capcol.radius = 0.23;
                    capcol.height = 1.2;
                    capcol.isTrigger = true;
                    capcol.enabled = false;
                    let rbod = otherPlayer.character.gameObject.AddComponent<Rigidbody>();
                    rbod.useGravity = false;
                    rbod.isKinematic = true;
                    otherPlayer.character.gameObject.tag = "Player";
                    // [RoomState] player 인스턴스의 state가 갱신될 때마다 호출됩니다.
                    player.OnChange += (changeValues) => this.OnUpdatePlayer(sessionId, player);
                }
            });
        }

        let join = new Map<string, Player>();
        let leave = new Map<string, Player>(this.currentPlayers);

        state.players.ForEach((sessionId: string, player: Player) => {
            if (!this.currentPlayers.has(sessionId)) {
                join.set(sessionId, player);
            }
            leave.delete(sessionId);
        });

        // [RoomState] Room에 입장한 player 인스턴스 생성
        join.forEach((player: Player, sessionId: string) => this.OnJoinPlayer(sessionId, player));

        // [RoomState] Room에서 퇴장한 player 인스턴스 제거
        leave.forEach((player: Player, sessionId: string) => this.OnLeavePlayer(sessionId, player));
    }

    private OnJoinPlayer(sessionId: string, player: Player) {
        console.log(`[OnJoinPlayer] players - sessionId : ${sessionId}`);
        this.currentPlayers.set(sessionId, player);

        const spawnInfo = new SpawnInfo();
        const position = this.ParseVector3(player.transform.position);
        const rotation = this.ParseVector3(player.transform.rotation);
        spawnInfo.position = this.startPoint.position;
        spawnInfo.rotation = this.startPoint.rotation;

        const isLocal = this.room.SessionId === player.sessionId;
        ZepetoPlayers.instance.CreatePlayerWithUserId(sessionId, player.zepetoUserId, spawnInfo, isLocal);
    }

    private OnLeavePlayer(sessionId: string, player: Player) {
        console.log(`[OnRemove] players - sessionId : ${sessionId}`);
        this.currentPlayers.delete(sessionId);

        ZepetoPlayers.instance.RemovePlayer(sessionId);
    }

    private OnUpdatePlayer(sessionId: string, player: Player) {

        const position = this.ParseVector3(player.transform.position);
        const rotation = this.ParseVector3(player.transform.rotation);
        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
        let _player = zepetoPlayer.character.gameObject;
        let charCor = _player.GetComponent<UnityEngine.CharacterController>();
        let capCol = _player.GetComponent<UnityEngine.CapsuleCollider>();
        let anim = zepetoPlayer.character.ZepetoAnimator;

        if (player.sit) {
            _player.transform.position = position;
            _player.transform.rotation = UnityEngine.Quaternion.Euler(rotation);
            charCor.enabled = false;
            capCol.enabled = true;
            anim.SetBool("Sit", player.sit);
            /*if (!this.isfireWork) {
                this.fireWork.transform.position = _player.transform.position;
                this.fireWork.SetActive(false);
                this.fireWork.SetActive(true);
                this.isfireWork = true;
            }*/
                
        }
        else if(player.sit2)
        {
            _player.transform.position = position;
            _player.transform.rotation = UnityEngine.Quaternion.Euler(rotation);
            charCor.enabled = false;
            capCol.enabled = true;
            anim.SetBool("Sit2", player.sit2);
        }
        else {
            anim.SetBool("Sit", player.sit);
            anim.SetBool("Sit2", player.sit2);
            charCor.enabled = true;
            capCol.enabled = false;
            let dist = UnityEngine.Vector3.Distance(_player.transform.position, position);
            if (dist > 5) {
                _player.transform.position = position;
            }
            else {
                zepetoPlayer.character.MoveToPosition(position);
            }
        }
        
        if (player.state === CharacterState.JumpIdle || player.state === CharacterState.JumpMove)
            zepetoPlayer.character.Jump();
    }

    OnUpdateGesture(sessionId: string, player: Player)
    {
        console.log("asdfasdf");
    }

    private SendTransform(transform: UnityEngine.Transform) {
        const data = new RoomData();

        const pos = new RoomData();
        pos.Add("x", transform.localPosition.x);
        pos.Add("y", transform.localPosition.y);
        pos.Add("z", transform.localPosition.z);
        data.Add("position", pos.GetObject());

        const rot = new RoomData();
        rot.Add("x", transform.localEulerAngles.x);
        rot.Add("y", transform.localEulerAngles.y);
        rot.Add("z", transform.localEulerAngles.z);
        data.Add("rotation", rot.GetObject());
        this.room.Send("onChangedTransform", data.GetObject());
    }

    private SendState(state: CharacterState) {
        const data = new RoomData();
        data.Add("state", state);
        this.room.Send("onChangedState", data.GetObject());
    }

    private ParseVector3(vector3: Vector3): UnityEngine.Vector3 {
        return new UnityEngine.Vector3
        (
            vector3.x,
            vector3.y,
            vector3.z
        );
    }

    *StopCharacterGesture(length: number, character: ZepetoCharacter)
    {
        yield new UnityEngine.WaitForSeconds(length);
        character.CancelGesture();
    }
}