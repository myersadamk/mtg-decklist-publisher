import {Observable} from "rxjs";
import DeckList from "../decklist";

export default interface DeckSource {
  getDecks(): Observable<DeckList>;
}