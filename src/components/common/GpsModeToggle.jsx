import { USE_MOCK_GPS, setMockGPS } from "../utils/helpers";

const GpsModeToggle = () => {
  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg p-3 rounded-md border">
      <label className="flex items-center space-x-2 text-sm">
        <input
          type="checkbox"
          defaultChecked={USE_MOCK_GPS}
          onChange={(e) => setMockGPS(e.target.checked)}
        />
        <span>{USE_MOCK_GPS ? "Mock GPS" : "Live GPS"}</span>
      </label>
    </div>
  );
};

export default GpsModeToggle;
