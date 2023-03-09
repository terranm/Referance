import {ZepetoScriptableObject, ZepetoScriptBehaviour} from 'ZEPETO.Script'
import {ZepetoWorldMultiplay} from 'ZEPETO.World'
import {Room, RoomData} from 'ZEPETO.Multiplay'
import {Player, State, Vector3} from 'ZEPETO.Multiplay.Schema'
import {CharacterState, SpawnInfo, ZepetoPlayers, ZepetoPlayer, ZepetoCharacterCreator, ZepetoCharacter} from 'ZEPETO.Character.Controller'
import * as UnityEngine from "UnityEngine";
import OtherPlayerCtrl from './OtherPlayerCtrl'
import DataSc from './DataSc'


export default class StarterBackup extends ZepetoScriptBehaviour {

    public multiplay: ZepetoWorldMultiplay;
    public OtherPlayer: UnityEngine.GameObject;
    public Controller: UnityEngine.GameObject;
    private room: Room;
    private currentPlayers: Map<string, Player> = new Map<string, Player>();
    private otherPlayersSc: Map<string, OtherPlayerCtrl> = new Map<string, OtherPlayerCtrl>();
    public player:UnityEngine.GameObject;
    public _player:Player;
    //public busTr:UnityEngine.Transform;
    //public returnPos:UnityEngine.Transform;
    //public carSpawnPos:UnityEngine.Transform;
    public scriptable:ZepetoScriptableObject<DataSc>;
    
    private Start() {

        this.multiplay.RoomCreated += (room: Room) => {
            this.room = room;
        };

        this.multiplay.RoomJoined += (room: Room) => {
            room.OnStateChange += this.OnStateChange;
        };

        this.StartCoroutine(this.SendMessageLoop(0.1));
        var spawn = new SpawnInfo();
        spawn.position = new UnityEngine.Vector3(-19, 0.1, -8);
        ZepetoCharacterCreator.CreateByZepetoId("zepeto.jang", spawn, (character : ZepetoCharacter)=>{
            var npcAnim = character.transform.gameObject.AddComponent<UnityEngine.Animator>();
            npcAnim.runtimeAnimatorController = this.scriptable["anim"] as UnityEngine.RuntimeAnimatorController;
            npcAnim.avatar = this.scriptable["avatar"] as UnityEngine.Avatar;
            //npcAnim.SetBool("isTest", true);
        });

    }

    // 일정 Interval Time으로 내(local)캐릭터 transform을 server로 전송합니다.
    private* SendMessageLoop(tick: number) {
        while (true) {
            yield new UnityEngine.WaitForSeconds(tick);
            if (this.room != null && this.room.IsConnected) {
                const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.room.SessionId);
                if (hasPlayer) {
                    const myPlayer = ZepetoPlayers.instance.GetPlayer(this.room.SessionId);
                    //현재 플레이어가 탑승 상태가 아니면 플레이어의 포지션을 서버로 전송
                    if (myPlayer.character.CurrentState != CharacterState.Idle && !this._player.isRide)
                        this.SendTransform(myPlayer.character.transform);
                        //현재 플레이어가 탑승 상태라면 탑승하고 있는 오브젝트의 포지션을 서버로 전송
                    if(this._player != null && this._player.isRide){
                        this.SendTransform(myPlayer.character.transform);
                    }
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
                myPlayer.character.gameObject.tag = "Player";
                let player_ins = UnityEngine.GameObject.Instantiate(this.player) as UnityEngine.GameObject;
                player_ins.transform.SetParent(myPlayer.character.transform);
                player_ins.transform.localPosition = UnityEngine.Vector3.zero;
                myPlayer.character.OnChangedState.AddListener((cur, next) => {
                    this.SendState(next);
                });
                console.log(myPlayer.name + " Player Load");
                ZepetoPlayers.instance.LocalPlayer.zepetoCamera.gameObject.transform.parent.GetChild(4).gameObject.SetActive(false);
                let controller = UnityEngine.GameObject.Instantiate(this.Controller) as UnityEngine.GameObject;
                controller.transform.SetParent(ZepetoPlayers.instance.LocalPlayer.zepetoCamera.gameObject.transform.parent);
            });
            // [CharacterController] Player 인스턴스가 Scene에 완전히 로드되었을 때 호출
            ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId: string) => {
                const isLocal = this.room.SessionId === sessionId;
                const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
                if (!isLocal) {
                    // zepetoPlayer.character.gameObject.tag = "Player";
                    // let player_ins = UnityEngine.GameObject.Instantiate(this.player) as UnityEngine.GameObject;
                    // player_ins.transform.SetParent(zepetoPlayer.character.transform);
                    // player_ins.transform.localPosition = UnityEngine.Vector3.zero;
                    // zepetoPlayer.character.OnChangedState.AddListener((cur, next) => {
                    //     this.SendState(next);
                    // });
                    console.log(zepetoPlayer.name + " Other Player Load");
                    const player: Player = this.currentPlayers.get(sessionId);
                    //OtherPlayer 스크립트를 가지고 있는 프리펩 로드
                    // let playerObj = UnityEngine.Resources.Load("OtherPlayer");
                    let _playerObj = UnityEngine.GameObject.Instantiate(this.OtherPlayer) as UnityEngine.GameObject;
                    let otherPlayerCtrl = _playerObj.GetComponent<OtherPlayerCtrl>();
                    //otherPlayerCtrl의 room, player 대입
                    otherPlayerCtrl.room = this.room;
                    otherPlayerCtrl.player = player;
                    let has = this.otherPlayersSc.has(sessionId);
                    if(has)
                    {
                        this.otherPlayersSc.set(sessionId, otherPlayerCtrl);
                    }
                    _playerObj.transform.parent = zepetoPlayer.character.transform;
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
        const position = new UnityEngine.Vector3(-19, 0.1, -8);//23,1,2
        //this.ParseVector3(player.transform.position);
        const rotation = new UnityEngine.Vector3(0, 90, 0);
        //this.ParseVector3(player.transform.rotation);
        spawnInfo.position = position;//new UnityEngine.Vector3(0 ,2, 5.5 );
        spawnInfo.rotation = UnityEngine.Quaternion.Euler(rotation);

        const isLocal = this.room.SessionId === player.sessionId;
        if(isLocal) this._player = player;
        console.log(isLocal);
        ZepetoPlayers.instance.CreatePlayerWithUserId(sessionId, player.zepetoUserId, spawnInfo, isLocal);    
        //ZepetoCharacterCreator.CreateByHashCode(player.zepetoHash, new SpawnInfo(), ()=>{});
    }

    private OnLeavePlayer(sessionId: string, player: Player) {
        console.log(`[OnRemove] players - sessionId : ${sessionId}`);
        this.currentPlayers.delete(sessionId);

        ZepetoPlayers.instance.RemovePlayer(sessionId);
    }

    private OnUpdatePlayer(sessionId: string, player: Player) {

        const position = this.ParseVector3(player.transform.position);
        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
        const playerSc = this.otherPlayersSc.get(sessionId);

        //캐릭터가 비행물체에 탑승중이라면
        if(!player.isRide){
            
            zepetoPlayer.character.characterController.enabled = true;
            //ZepetoCharacter컴포넌트 비활성화
            zepetoPlayer.character.enabled = true;
            zepetoPlayer.character.MoveToPosition(position);
            if (player.state === CharacterState.JumpIdle || player.state === CharacterState.JumpMove)
            zepetoPlayer.character.Jump();
            
        }
        else{
            //다른 플레이어가 탑승상태일때 동기화
            //다른 플레이어의 캐릭터 컨트롤러 비활성화
            //활성화 시 외부스크립트에서 포지션 변경 불가
            zepetoPlayer.character.characterController.enabled = false;
            //ZepetoCharacter컴포넌트 비활성화
            //활성화 시 현재 상태 및 회전값의 지속적인 변경으로 캐릭터 커스텀 안됨
            zepetoPlayer.character.enabled = false;
            
        }
        
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
        //console.log("transform Send " + this.room.Id);
    }

    private SendTransformCar(transform: UnityEngine.Transform) {
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
        this.room.Send("onChangedTransformCar", data.GetObject());
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
}