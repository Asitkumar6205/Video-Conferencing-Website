class PeerService {
    constructor() {
        if(!this.Peer) {
            this.Peer = new RTCPeerConnection({
                iceServers: [{
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478",
                    ]
                }]
            })
        }
    }
async setLocalDescription(ans){
        if(this.Peer){
            await this.Peer.setRemoteDescription(new RTCSessionDescription(ans))
        }
    }
    async getAnswer(offer) {
        if(this.Peer) {
            await this.Peer.setRemoteDescription(offer);
            const ans = await this.Peer.createAnswer();
            await this.Peer.setLocalDescription(new RTCSessionDescription(ans));
            return ans;
        }
    }

    

    async getOffer() {
        if(this.Peer) {
            const offer = await this.Peer.createOffer();
            await this.Peer.setLocalDescription(new RTCSessionDescription(offer))
            return offer;
        }
    }
}

export default new PeerService();