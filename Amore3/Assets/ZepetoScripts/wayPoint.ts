
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Collider, GameObject, Quaternion, Time, Transform, Vector3, WaitForSeconds } from 'UnityEngine';
import { RoomData } from 'ZEPETO.Multiplay';
import { ZepetoWorldMultiplay } from 'ZEPETO.World';



export default class wayPoint extends ZepetoScriptBehaviour {

    public number: number = 0;
    public foodPos: Transform[];
    public speed: float = 1;
    public foodNum = 0;
    public dir: Vector3;
    isStop: boolean;
    isDown: boolean;
    multiplay: ZepetoWorldMultiplay;

    Start()
    {
        this.multiplay = GameObject.Find("WorldMultiplay").GetComponent<ZepetoWorldMultiplay>();
        //this.transform.position = this.foodPos[this.foodNum].transform.position;
        if(this.number == 0)
            this.StartCoroutine(this.UpSpeed());
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
            this.transform.rotation = Quaternion.Slerp(this.transform.rotation, Quaternion.LookRotation(dir), Time.deltaTime * 0.7);
        }
        else {
            if (this.foodNum +1 < this.foodPos.Length) {
                dir = (this.foodPos[this.foodNum++].transform.position - this.transform.position).normalized;
            } else if (this.foodNum + 1 > this.foodPos.Length){
                dir = (this.foodPos[0].transform.position - this.transform.position).normalized;
            }
           
            this.transform.rotation = Quaternion.Slerp(this.transform.rotation, Quaternion.LookRotation(dir), Time.deltaTime * 0.8);
        }
        
        //this.transform.LookAt(this.foodPos[this.foodNum].transform.position);

        if (this.transform.position == this.foodPos[this.foodNum].transform.position){
             this.dir = new Vector3((this.foodPos[this.foodNum].transform.position.x - this.transform.position.x), (this.foodPos[this.foodNum].transform.position.y - this.transform.position.y), 0).normalized;
            //this.transform.rotation = Quaternion.LookRotation(this.dir);
            this.foodNum++;
        }

        if (this.foodNum == 11 && this.number == 0 && !this.isDown) {
            this.StopDown();
        }

        if (this.foodNum == this.foodPos.Length-1) {
            this.foodNum = 0;
        }
            

        this.SendTransform(this.gameObject.transform);
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
        this.multiplay.Room.Send("onChangedCarTransform", data.GetObject());
    }


    StopDown() {
        this.isDown = true;
        this.StartCoroutine(this.DownSpeed());
    }


    *UpSpeed() {

        while (this.speed < 20) {
            yield new WaitForSeconds(1);
            this.speed += 2;
            if (this.speed >= 20) return;
        }
       
    }

    *DownSpeed() {
        while (this.speed > 0) {
            yield new WaitForSeconds(2);
            console.log(this.isDown);
            this.speed -= 2;
            if (this.speed <= 0) {
                this.isDown = false;
                this.speed = 0;
                yield new WaitForSeconds(5);
                console.log("reStart");
                this.StartCoroutine(this.UpSpeed());
                return;
             }
        }
    }
}