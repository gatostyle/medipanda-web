export const BoardUtils = {
  isNewPost(date: Date): boolean {
    try {
      const now = new Date();
      const difference = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      return difference <= 7;
    } catch {
      return false;
    }
  },
};
