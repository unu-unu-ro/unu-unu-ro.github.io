#!/usr/bin/env node
/**
 * generate-ics.js
 * Reads every schedules/*.json and writes a matching calendars/*.ics file.
 * Run: node scripts/generate-ics.js
 */

const fs = require("fs");
const path = require("path");

const SCHEDULES_DIR = path.join(__dirname, "..", "schedules");
const CALENDARS_DIR = path.join(__dirname, "..", "calendars");

// Ensure output directory exists
if (!fs.existsSync(CALENDARS_DIR)) {
  fs.mkdirSync(CALENDARS_DIR);
}

function toICSDateTime(dateStr, timeStr) {
  const [year, month, day] = dateStr.split("-");
  const [hour, minute] = timeStr.split(":");
  return `${year}${month}${day}T${hour}${minute}00`;
}

function dtstamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}` +
    `T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`
  );
}

function escapeICS(str) {
  return str.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function buildVEVENT(activity, dateStr, location, timezone) {
  const start = toICSDateTime(dateStr, activity.startTime);
  const end = activity.endTime
    ? toICSDateTime(dateStr, activity.endTime)
    : toICSDateTime(dateStr, activity.startTime);
  const uid = `${activity.id || activity.title.replace(/\s+/g, "-")}-${dateStr}@unu-unu.ro`;

  const lines = [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp()}`,
    `DTSTART;TZID=${timezone}:${start}`,
    `DTEND;TZID=${timezone}:${end}`,
    `SUMMARY:${escapeICS(activity.title)}`,
  ];
  if (activity.description) lines.push(`DESCRIPTION:${escapeICS(activity.description)}`);
  if (location) lines.push(`LOCATION:${escapeICS(location)}`);
  lines.push("END:VEVENT");
  return lines.join("\r\n");
}

function generateICS(scheduleData) {
  const timezone = scheduleData.eventInfo?.timezone || "Europe/Bucharest";
  const location = scheduleData.eventInfo?.location || "";

  const vevents = [];
  for (const day of scheduleData.days || []) {
    for (const activity of day.activities || []) {
      vevents.push(buildVEVENT(activity, day.date, location, timezone));
    }
  }

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Unu Unu//Calendar//RO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...vevents,
    "END:VCALENDAR",
  ].join("\r\n");
}

// Process all JSON files in schedules/
const files = fs.readdirSync(SCHEDULES_DIR).filter((f) => f.endsWith(".json"));

if (files.length === 0) {
  console.log("No schedule JSON files found.");
  process.exit(0);
}

let generated = 0;
for (const file of files) {
  const inputPath = path.join(SCHEDULES_DIR, file);
  const outputPath = path.join(CALENDARS_DIR, file.replace(".json", ".ics"));

  const raw = fs.readFileSync(inputPath, "utf-8");
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`  ✗ ${file}: invalid JSON — ${e.message}`);
    continue;
  }

  if (!data.days || data.days.length === 0) {
    console.log(`  – ${file}: no days, skipping`);
    continue;
  }

  const ics = generateICS(data);
  fs.writeFileSync(outputPath, ics, "utf-8");
  console.log(`  ✓ ${file}  →  calendars/${file.replace(".json", ".ics")}`);
  generated++;
}

console.log(`\nDone. ${generated} file(s) written to calendars/`);
