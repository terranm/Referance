
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Collider, GameObject, Quaternion, Time, Transform, Vector3, WaitForSeconds } from 'UnityEngine';
import { Room, RoomData } from 'ZEPETO.Multiplay';
import { ZepetoWorldMultiplay } from 'ZEPETO.World';
import { Player, State, vector3 } from 'ZEPETO.Multiplay.Schema';


interface BusInfo {
    index: number,
    position:vector3,
    rotation:vector3
}
export default class wayPoint extends ZepetoScriptBehaviour {

    public number: number = 0;
    public foodPos: Transform[];
    public speed: float = 1;
    public foodNum = 0;
    public dir: Vector3;
    isStop: boolean;
    isDown: boolean;
    multiplay: ZepetoWorldMultiplay;
    room:Room;
    player:Player;
    Start()
    {
        this.multiplay = GameObject.Find("WorldMultiplay").GetComponent<ZepetoWorldMultiplay>();
        // this.multiplay.RoomCreated += (room: Room) => {
        //     this.room = room;
        //     room.OnStateChange += this.OnStateChange;
        //     this.room.AddMessageHandler("Bus", (message:BusInfo)=>{
        //         this.foodNum = message.index;
        //         this.transform.position = this.ParseVector3(message.position);
        //         this.transform.rotation = Quaternion.Euler(this.ParseVector3(message.rotation));
        //     });
        // };
        
    }

    FixedUpdate()
    {
        if(this.multiplay.Room != null && this.multiplay.Room.IsConnected && !this.isStop)
            this.MovePath();
    }

    public MovePath()
    {
        this.transform.position = Vector3.MoveTowards
            (this.transform.position, this.foodPos[this.foodNum].transform.position, this.speed * Time.deltaTime);
        let dir: Vector3 = Vector3.zero;
        dir = (this.foodPos[this.foodNum].transform.position - this.transform.position).normalized;
        let dist = Vector3.Distance(this.foodPos[this.foodNum].transform.position, this.transform.position)
        if (dist > 0.5) {
            this.transform.rotation = Quaternion.Slerp(this.transform.rotation, Quaternion.LookRotation(dir), Time.deltaTime * 1);
        }
        else {
            if (this.foodNum +1 < this.foodPos.Length) {
                dir = (this.foodPos[this.foodNum++].transform.position - this.transform.position).normalized;
            } else if (this.foodNum + 1 > this.foodPos.Length){
                dir = (this.foodPos[0].transform.position - this.transform.position).normalized;
            }
           
            this.transform.rotation = Quaternion.Slerp(this.transform.rotation, Quaternion.LookRotation(dir), Time.deltaTime * 1);
        }
        
        //this.transform.LookAt(this.foodPos[this.foodNum].transform.position);

        if (this.transform.position == this.foodPos[this.foodNum].transform.position){
             this.dir = new Vector3((this.foodPos[this.foodNum].transform.position.x - this.transform.position.x), (this.foodPos[this.foodNum].transform.position.y - this.transform.position.y), 0).normalized;
            //this.transform.rotation = Quaternion.LookRotation(this.dir);
            this.foodNum++;
        }

        // if (this.foodNum == 11 && this.number == 0 && !this.isDown) {
        //     this.StopDown();
        // }

        if (this.foodNum == this.foodPos.Length) {
            this.foodNum = 0;
        }
            
        if(this.player != null && this.player.King)
            this.SendTransform(this.gameObject.transform);
    }

    private OnStateChange(state: State, isFirst: boolean) {

        // 첫 OnStateChange 이벤트 수신 시, State 전체 스냅샷을 수신합니다.
        if (isFirst) {
            state.players.ForEach((sessionId: string, player: Player) => {
               if(this.room.SessionId == sessionId){
                this.player= player;
                
               }
            });
        }

    }

    private SendTransform(transform: Transform)
    {
        const data = new RoomData();
        const pos = new RoomData();

        pos.Add("x", transform.position.x);
        pos.Add("y", transform.position.y);
        pos.Add("z", transform.position.z);
        data.Add("position", pos.GetObject());

        const rot = new RoomData();
        rot.Add("x", transform.localEulerAngles.x);
        rot.Add("y", transform.localEulerAngles.y);
        rot.Add("z", transform.localEulerAngles.z);
        data.Add("rotation", rot.GetObject());
        data.Add("index", this.foodNum);
        this.multiplay.Room.Send("BusInfo", data.GetObject());
    }

    private ParseVector3(vector3: vector3): Vector3 {
        return new Vector3
        (
            vector3.x,
            vector3.y,
            vector3.z
        );
    }
   
}