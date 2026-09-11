/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable("users", {
    id: { type: "serial", primaryKey: true },
    name: { type: "VARCHAR(255)", notNull: true },
    email: { type: "VARCHAR(255)", notNull: true, unique: true },
    role: {
      type: "VARCHAR(50)",
      notNull: true,
      default: "user",
      check: "role IN ('admin', 'user', 'moderator')",
    },
    active: { type: "BOOLEAN", notNull: true, default: true },
    created_at: {
      type: "TIMESTAMPTZ",
      notNull: true,
      default: pgm.func("now()"),
    },
    updated_at: {
      type: "TIMESTAMPTZ",
      notNull: true,
      default: pgm.func("now()"),
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("users");
};