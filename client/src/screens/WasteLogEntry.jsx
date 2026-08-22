import dayjs from 'dayjs';

import TextInput from "../components/TextInput";
import Button from "../components/Button";

import "/src/assets/styles/logentry.css";

function WasteLogEntry(){
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Waste log submitted.') // Connect to API later.
    };

    return (
        <div id='wastelog-screen'>
            <div id="wastelog-header">
                <h1>Waste Log Entry</h1>
            </div>
            <div id="wastelog-frame">
                <form onSubmit={handleSubmit}>
                    <TextInput fieldName="Ingredient:" placeholder="Enter ingredient" id="ingredient" />
                    <TextInput fieldName="Weight (lbs):" placeholder="Enter weight in lbs" id="weight" />
                    <hr/>
                    <p>Waste Value: $0.00</p>
                    <p>Timestamp: {dayjs().format('YYYY-MM-DD hh:mm a')}</p>
                    <hr/>
                    <Button type='submit' buttonText='Submit' style={{color:'white', backgroundColor:'var(--primary-color)'}}/>
                </form>
            </div>
        </div>
    );
}

export default WasteLogEntry;