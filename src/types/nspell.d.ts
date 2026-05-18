declare module 'nspell' {
  interface NSpellInstance {
    correct(word: string): boolean;
    suggest(word: string): string[];
    add(word: string): void;
    remove(word: string): void;
  }

  interface NSpellOptions {
    aff: string;
    dic: string;
  }

  function nspell(options: NSpellOptions): NSpellInstance;
  export default nspell;
}
