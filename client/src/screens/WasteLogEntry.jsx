import { useState } from "react";
import dayjs from 'dayjs';

import TextInput from "../components/TextInput";
import Button from "../components/Button";
import Dropdown from '../components/Dropdown';

import "/src/assets/styles/logentry.css";

function WasteLogEntry(){
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Waste log submitted.'); // Connect to API later.
    };

    const [ingredient, setIngredient] = useState('');

    return (
        <div id='wastelog-screen'>
            <div id="wastelog-header">
                <h1>Waste Log Entry</h1>
            </div>
            <div id="wastelog-frame">
                <form onSubmit={handleSubmit}>
                    <Dropdown
                        fieldName="Ingredient"
                        id="ingredient"
                        required
                        options={[{ value: 1, label: 'Chicken Breast' }, { value: 2, label: 'Rice' }]}
                        value={ingredient}
                        onChange={(e) => setIngredient(e.target.value)}
                    />
                    <TextInput fieldName="Weight (lbs):" placeholder="Enter weight in lbs" id="weight" required />
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