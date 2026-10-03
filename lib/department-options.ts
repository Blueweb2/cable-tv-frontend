import { getServices } from "./services.api.ts";

export const STANDARD_DEPARTMENTS = [
  "Fiber Optics & Splicing",
  "Field Linesmen & Wiring",
  "Network Operations (NOC)",
  "New Installations & STB Setup",
  "Customer Support & Dispatch",
  "Billing & Collection",
  "General Field Operations",
];

export const STANDARD_SPECIALIZATIONS = [
  "Fiber Technician",
  "Linesman",
  "Installation Technician",
  "NOC Specialist",
  "Support & Dispatch",
  "Billing Agent",
  "Field Technician",
];

export async function getDepartmentAndServiceOptions(
  currentValue?: string
): Promise<string[]> {
  const optionsList: string[] = [...STANDARD_DEPARTMENTS];

  try {
    const services = await getServices();
    if (Array.isArray(services) && services.length > 0) {
      services.forEach((s) => {
        if (s.name?.trim()) {
          optionsList.push(s.name.trim());
        }
        if (s.category?.trim()) {
          const formattedCategory = s.category
            .trim()
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
          optionsList.push(formattedCategory);
        }
      });
    }
  } catch (err) {
    console.warn("Could not load dynamic services for department list", err);
  }

  if (currentValue?.trim()) {
    optionsList.push(currentValue.trim());
  }

  return Array.from(new Set(optionsList)).filter(Boolean).sort();
}

export function getSpecializationOptions(currentValue?: string): string[] {
  const options = [...STANDARD_SPECIALIZATIONS];
  if (currentValue?.trim() && !options.includes(currentValue.trim())) {
    options.push(currentValue.trim());
  }
  return options;
}
