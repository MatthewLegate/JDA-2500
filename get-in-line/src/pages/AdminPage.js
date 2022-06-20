import * as React from 'react';
import GetInLineTitle from '../components/GetInLineTitle';
import LogoutButton from '../components/LogoutButton';
import { useNavigate } from 'react-router-dom';
import Event from '../components/Event';

import { db } from '../Firebase';
import { collection, doc, getDocs, query, setDoc, limit, onSnapshot, deleteDoc } from 'firebase/firestore';
import { async } from '@firebase/util';

//pull request demo

export default function AdminPage() {
  const [events, setEvents] = React.useState([]);

  React.useEffect(() => {
    const q = query(collection(db, "event"));
    const eventList = onSnapshot(q, (querySnapshot) => {
      let eventsArray = [];
      querySnapshot.forEach((doc) => {
        eventsArray.push({ ...doc.data(), id: doc.id });
      });
      setEvents(eventsArray);
    });
    return () => eventList();
  }, []);

  const handleDelete = async (eventName) => {
    await deleteDoc(doc(db, "event", eventName));
  };

  let navigate = useNavigate();

  return (
    <div>
      <GetInLineTitle/>
        <p id='queues'></p>
        <div className='event_container'>
          {events.map((event) => (
            <Event 
              //key={event.name}
              event={event}
              handleDelete={handleDelete}
            />
          ))}
        </div>
        <button onClick={() => showExistingQueues()}>
          View Existing Queues
          </button>
        <button> Settings </button>
        <LogoutButton/>
        <br/><br/><br/><hr/><br/><br/><br/>
        Event Name* <input type="text" id="eventName"/> <br/>
        Address <input type="text" id="address"/> <br/>
        <button onClick={() => verifyEvent()}> Add Event </button>
    </div>
  )


  // ----------------------- Functions -----------------------
  function verifyEvent() {
    var eventName = document.getElementById("eventName").value;
    var address = document.getElementById("address").value;

    if (eventName.length === 0) {
      alert("Event Name is Required!")
      return;
    } else {
      addEvent(eventName, address);
    }
  }

  function addEvent(eventName, addressInput) {
    const path = 'event/' + eventName;
    const newEvent = doc(db, path);
    const docData = {
      address: addressInput,
      name: eventName,
      numOfPeople: 0,
      queue: []
    };
    setDoc(newEvent, docData);
    alert("Adding " + eventName + " to database");
  }

  async function showExistingQueues() {
    const queuesQuery = query(
      collection(db, 'event'),
      limit(100) // Just to make sure we're not querying more than 100 events. Can be removed if database grows and is needed
    );

    const querySnapshot = await getDocs(queuesQuery);
    var listOfQueues = "";
    const allDocs = querySnapshot.forEach((snap) => {
      listOfQueues += snap.data().name + " - " + JSON.stringify(snap.data()) + "<br/>";
    });

    document.getElementById("queues").innerHTML = listOfQueues;
  }

}
