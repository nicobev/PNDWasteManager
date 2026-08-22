// screens/ComponentPlayground.jsx
// TEMP FILE — for visually testing all shared components at once.
// Delete or exclude from routing once real screens are built out.

import { useState } from "react";
import TextInput from "../components/TextInput";
import Dropdown from "../components/Dropdown";
import DatePicker from "../components/Datepicker";
import RadioGroup from "../components/RadioGroup";
import Toggle from "../components/Toggle";
import Button from "../components/Button";

function ComponentPlayground() {
  const [username, setUsername] = useState('');
  const [ingredient, setIngredient] = useState('');
  const [startDate, setStartDate] = useState('');
  const [reportType, setReportType] = useState('Daily');
  const [status, setStatus] = useState('Active');

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '400px' }}>
      <h1>Component Playground</h1>

      <section>
        <h3>TextInput (required, empty on purpose)</h3>
        <TextInput
          fieldName="Username"
          placeholder="Enter username"
          id="playground-username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </section>

      <section>
        <h3>Dropdown (required, empty on purpose)</h3>
        <Dropdown
          fieldName="Ingredient"
          id="playground-ingredient"
          required
          options={[
            { value: '1', label: 'Chicken Breast' },
            { value: '2', label: 'White Rice' },
            { value: '3', label: 'Broccoli' },
          ]}
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
        />
      </section>

      <section>
        <h3>DatePicker (required, empty on purpose)</h3>
        <DatePicker
          fieldName="Start Date"
          id="playground-startdate"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </section>

      <section>
        <h3>RadioGroup</h3>
        <RadioGroup
          fieldName="Report Type"
          name="playground-reporttype"
          options={[
            { value: 'Daily', label: 'Daily' },
            { value: 'Timed', label: 'Timed' },
            { value: 'Trend', label: 'Trend' },
          ]}
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        />
        <p>Selected: {reportType}</p>
      </section>

      <section>
        <h3>Toggle</h3>
        <Toggle
          fieldName="Status"
          id="playground-status"
          value={status === 'Active'}
          onChange={(isOn) => setStatus(isOn ? 'Active' : 'Inactive')}
          onLabel="Active"
          offLabel="Inactive"
        />
        <p>Current value: <strong>{status}</strong></p>
      </section>

      <section>
        <h3>Button</h3>
        <Button
          buttonText="Test Button"
          id="playground-button"
          type="button"
          onClick={() => alert('Button clicked')}
        />
      </section>
    </div>
  );
}

export default ComponentPlayground;