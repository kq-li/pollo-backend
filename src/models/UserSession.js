// @flow
import crypto from 'crypto';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Base from './Base';
import User from './User';

/**
 * UserSession class represents the sessions used for authentication.
 * @extends {Base}
 */
@Entity('usersessions')
class UserSession extends Base {
  /** Unique identifier */
  @PrimaryGeneratedColumn()
  id: any = null;

  /** Access token associated with session */
  @Column('character varying')
  sessionToken: string = '';

  /** Timestamp of when the session expires (Unix time) */
  @Column('bigint')
  expiresAt: string = '-1';

  /** Refresh token associated with session */
  @Column('character varying')
  updateToken: string = '';

  /** Whether the session is active or not */
  @Column('boolean')
  isActive: boolean = true;

  /** User that the session belongs to */
  @OneToOne(type => User)
  @JoinColumn()
  user: ?User = null;

  /**
   * Creates session from user
   * @function
   * @param {User} user - user we want to create a session for
   * @param {string} [accessToken] - access token for session
   * @param {string} [refreshToken] - update token for session
   * @return {UserSession} session created using parameters
   */
  static fromUser(
    user: User,
    accessToken: ?string,
    refreshToken: ?string,
  ): UserSession {
    const session = new UserSession();
    session.user = user;
    session.update(accessToken, refreshToken);
    return session;
  }

  /**
   * Refreshes session
   * @function
   * @param {string} [accessToken] - new access token for session
   * @param {string} [updateToken] - new update token for session
   * @return {UserSession} updated session
   */
  update(accessToken: ?string, updateToken: ?string): UserSession {
    this.sessionToken = accessToken || crypto.randomBytes(64).toString('hex');
    this.updateToken = updateToken || crypto.randomBytes(64).toString('hex');

    // Session length is 1 day
    this.expiresAt = String(Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24);
    this.activate();
    return this;
  }

  /**
   * Marks session as active
   * @function
   * @return {UserSession} updated, active session
   */
  activate(): UserSession {
    this.isActive = true;
    return this;
  }

  /**
   * Marks session as inactive
   * @function
   * @returns {UserSession} updated, inactive session
   */
  logOut(): UserSession {
    this.isActive = false;
    return this;
  }
}

export default UserSession;
