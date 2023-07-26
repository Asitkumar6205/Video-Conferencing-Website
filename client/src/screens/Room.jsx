import React, { useCallback, useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import { useSocket } from '../context/SocketProvider';
import Peer from "../service/Peer";

const RoomPage = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    const handleUserJoined = useCallback(({email, id}) => {
        console.log(`Email ${email} joined room`);
        setRemoteSocketId(id);
    }, []) 

    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });

        const offer = await Peer.getOffer();
        socket.emit("user:call", { to : remoteSocketId, offer });

        setMyStream(stream)
    }, [remoteSocketId, socket]);

    const handleIncomingCall = useCallback(async ({from, offer}) => {
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        setMyStream(stream);
        console.log(`Incoming Call`,  from, offer);
        const ans = await Peer.getAnswer(offer)
        socket.emit("call:accepted", { to: from, ans})
    }, []);

    const handleCallAccepted = useCallback(({from, ans}) => {
        Peer.setLocalDescription(ans)
        console.log("Call Accepted");
        for (const track of myStream.getTracks()) {
            Peer.Peer.addTrack(track, myStream);
        }   
    }, [myStream]);

    const handleNegoNeeded = useCallback(async () => {
        const offer = await Peer.getOffer();
        socket.emit('peer:nego:needed', { offer, to: remoteSocketId });
    }, [remoteSocketId, socket]);

    useEffect(() => {
        Peer.Peer.addEventListener('negotiationneeded', handleNegoNeeded);
        return () => {
            Peer.Peer.removeEventListener('negotiationneeded', handleNegoNeeded);
        }
    }, [handleNegoNeeded]);

    const handleNegoNeedIncoming = useCallback(({ from, offer }) => {
        const ans = Peer.getAnswer(offer);
        socket.emit('peer:nego:done', {to: from, ans});
    }, [socket]);
    
    const handleNegoNeedFinal = useCallback(async ({ ans }) => {
        await Peer.setLocalDescription(ans);
    }, [])

    useEffect(() => {
        Peer.Peer.addEventListener('track', async ev =>{
            const remoteStream = ev.streams;
            setRemoteStream(remoteStream);
        })
    }, [])

    useEffect(() => {
        socket.on('user:joined', handleUserJoined)
        socket.on('incoming:call', handleIncomingCall)
        socket.on('call:accepted', handleCallAccepted)
        socket.on('peer:nego:needed', handleNegoNeedIncoming)
        socket.on('peer:nego:final', handleNegoNeedFinal)
        return () => {
            socket.off("user:joined", handleUserJoined)
            socket.off('incoming:call', handleIncomingCall)
            socket.off('call:accepted', handleCallAccepted)
            socket.off('peer:nego:needed', handleNegoNeedIncoming)
            socket.off('peer:nego:final', handleNegoNeedFinal)
        }

    }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoNeedIncoming, handleNegoNeedFinal]);

    

    return (
        <div>
            <h1>Room Page</h1>
            <h4>{remoteSocketId ? 'Connected' : 'No One in Room'}</h4>
            {remoteSocketId && <button onClick={handleCallUser}>Call</button>}
            {myStream && (
                <>
                    <ReactPlayer 
                        playing
                        muted
                        height="200px"
                        width="240px"
                        url={myStream}
                    />
                </>
            )}
            {remoteStream && (
                <>
                    <ReactPlayer 
                        playing
                        muted
                        height="200px"
                        width="240px"
                        url={remoteStream}
                    />
                </>
            )}
        </div>
    )
}

export default RoomPage;