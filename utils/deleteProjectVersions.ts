import type { Version } from "../data/interfaces";
import versionsSchema from "../schemas/versionsSchema";

export default async (versions: Version[]) => {
  if (versions.length > 0) {
    const deletePromises = versions.map((version) =>
      versionsSchema.findByIdAndDelete(version.id)
    );
    await Promise.all(deletePromises);
  }
};
