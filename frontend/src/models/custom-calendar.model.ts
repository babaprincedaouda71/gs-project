import {CalendarEvent} from "angular-calendar";

export interface CustomCalendarEvent extends CalendarEvent {
  id: number;
  bgColor: string;
  groupId?: number; // Pour identifier la session
  isConsecutive: boolean; // Pour différencier le type d'affichage
}
