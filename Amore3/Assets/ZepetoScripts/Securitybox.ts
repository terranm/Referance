import { Collider, Color, Mathf, Random } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import Lip from './Lip';

export default class Securitybox extends ZepetoScriptBehaviour {

    Start() {    

    }

    OnTriggerEnter(other: Collider)
    {
        if (other.gameObject.tag == "Cosme")
        {
            let random = Random.Range(0.176, 0.31);
            let material = other.gameObject.GetComponent<Lip>().material;
            material.color = new Color(1, 0.1745, random, 1);
        }
    }

}