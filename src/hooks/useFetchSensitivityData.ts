import { useEffect, useState } from "react";
import { SensitivityDataset } from "@/types/uiTypes";

export const useFetchSensitivityData = () => {
    const [data, setData] = useState<SensitivityDataset | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/v1/dashboard/sensitivity")
            .then((response) => response.json())
            .then((data) => {
                setData(data);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return { data, loading };
}