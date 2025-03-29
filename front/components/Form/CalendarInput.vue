<template>
  <div class="calendar-wrapper">
    <div class="calendar-input">
      <input
        type="text"
        :value="displayValue"
        readonly
        @click="showCalendar = !showCalendar"
        class="date-input"
      />
      <span class="calendar-icon" @click="showCalendar = !showCalendar">
        📅
      </span>
    </div>

    <div v-if="showCalendar" class="calendar-dropdown">
      <div class="calendar-header">
        <button @click="previousMonth">&lt;</button>
        <span>{{ currentMonthYear }}</span>
        <button @click="nextMonth">&gt;</button>
      </div>

      <div class="calendar-days">
        <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
        <div
          v-for="date in calendarDates"
          :key="date.date"
          :class="[
            'calendar-day',
            { 'current-month': date.currentMonth },
            { selected: isSelected(date.date) },
            { 'in-range': isInRange(date.date) },
            { 'range-start': isRangeStart(date.date) },
            { 'range-end': isRangeEnd(date.date) },
          ]"
          @click="selectDate(date.date)"
        >
          {{ date.day }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      start: new Date(),
      end: new Date(),
    }),
  },
  format: {
    type: String,
    default: "DD/MM/YYYY",
  },
});

const emit = defineEmits(["update:modelValue"]);

const showCalendar = ref(false);
const currentDate = ref(new Date(props.modelValue.start));
const selectedStart = ref(new Date(props.modelValue.start));
const selectedEnd = ref(new Date(props.modelValue.end));
const isSelectingEnd = ref(false);

const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const displayValue = computed(() => {
  const startStr = formatDate(selectedStart.value, props.format);
  const endStr = formatDate(selectedEnd.value, props.format);
  return `${startStr} - ${endStr}`;
});

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
});

const calendarDates = computed(() => {
  return generateCalendarDates(currentDate.value);
});

function generateCalendarDates(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const dates = [];

  // Ajout des jours du mois précédent
  const firstWeekday = firstDay.getDay() || 7;
  for (let i = firstWeekday - 1; i > 0; i--) {
    const prevDate = new Date(year, month, 1 - i);
    dates.push({
      date: prevDate,
      day: prevDate.getDate(),
      currentMonth: false,
    });
  }

  // Ajout des jours du mois courant
  for (let i = 1; i <= lastDay.getDate(); i++) {
    dates.push({
      date: new Date(year, month, i),
      day: i,
      currentMonth: true,
    });
  }

  // Ajout des jours du mois suivant
  const remainingDays = 42 - dates.length;
  for (let i = 1; i <= remainingDays; i++) {
    const nextDate = new Date(year, month + 1, i);
    dates.push({
      date: nextDate,
      day: nextDate.getDate(),
      currentMonth: false,
    });
  }

  return dates;
}

function formatDate(date, format) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return format.replace("DD", day).replace("MM", month).replace("YYYY", year);
}

function selectDate(date) {
  if (!isSelectingEnd.value) {
    selectedStart.value = date;
    selectedEnd.value = date;
    isSelectingEnd.value = true;
  } else {
    if (date < selectedStart.value) {
      selectedEnd.value = selectedStart.value;
      selectedStart.value = date;
    } else {
      selectedEnd.value = date;
    }
    isSelectingEnd.value = false;
    showCalendar.value = false;
    emit("update:modelValue", {
      start: selectedStart.value,
      end: selectedEnd.value,
    });
  }
}

function isSelected(date) {
  const dateStr = date.toDateString();
  return (
    dateStr === selectedStart.value.toDateString() ||
    dateStr === selectedEnd.value.toDateString()
  );
}

function isInRange(date) {
  return date > selectedStart.value && date < selectedEnd.value;
}

function isRangeStart(date) {
  return date.toDateString() === selectedStart.value.toDateString();
}

function isRangeEnd(date) {
  return date.toDateString() === selectedEnd.value.toDateString();
}

function previousMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
}

function nextMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
}
</script>

<style lang="scss" scoped>
$hover-color: #f0f0f0;
$range-bg: #e6f3ff;

$dark-bg: #2d2d2d;
$dark-border: #444;
$dark-hover: #3d3d3d;
$dark-range: #1a365d;
$dark-text-light: #666;
$dark-text: #fff;

.calendar-wrapper {
  position: relative;
  width: 100%;
  max-width: 300px;
}

.calendar-input {
  position: relative;
  width: 100%;

  .date-input {
    width: 100%;
    padding: 8px 32px 8px 12px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background-color: var(--color-bg);
    cursor: pointer;
  }

  .calendar-icon {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
  }
}

.calendar-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 8px;
  margin-top: 4px;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  button {
    border: none;
    background: none;
    cursor: pointer;
    padding: 4px 8px;
  }
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
}

.weekday {
  font-weight: 300;
  color: var(--color-text-subtitle);
  padding: 4px;
  cursor: default;
}

.calendar-day {
  padding: 6px;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: var(--violet-4);
  }

  &.current-month {
    color: var(--color-text);
  }

  &:not(.current-month) {
    color: var(--color-text-subtitle);
  }

  &.selected {
    background-color: var(--color-primary);
    color: var(--color-text);
  }

  &.in-range {
    background-color: var(--violet-3);
    border-radius: 0;
  }

  &.range-start {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    background-color: var(--color-primary);
    color: var(--color-reverse-text);
  }

  &.range-end {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    background-color: var(--color-primary);
    color: var(--color-reverse-text);
  }
}
</style>
