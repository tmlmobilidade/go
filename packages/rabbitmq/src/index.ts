/* * */

import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { connect as amqpConnect, Channel, ChannelModel, Options, Replies } from 'amqplib';

/* * */

export interface RabbitMQConfig {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	socketOptions?: any
	uri: Options.Connect | string
}

export class RabbitMQConnector {
	private channel?: Channel;
	private config: RabbitMQConfig;
	private connection?: ChannelModel;

	constructor(config: RabbitMQConfig) {
		this.config = config;
	}

	/**
	 * Connects to RabbitMQ and creates a channel.
	 */
	async connect(): Promise<void> {
		try {
			this.connection = await amqpConnect(this.config.uri, this.config.socketOptions);
			this.channel = await this.connection.createChannel();
			console.log('Connected to RabbitMQ.');

			this.channel.on('close', () => {
				console.warn('Channel closed, reconnecting...');
				setTimeout(this.connect.bind(this), 5000);
			});

			this.channel.on('error', (err) => {
				console.error('Channel error:', err);
			});
		} catch (error) {
			console.error('Failed to connect to RabbitMQ:', error);
			throw error;
		}
	}

	/**
   * Disconnects from RabbitMQ.
   */
	async disconnect(): Promise<void> {
		if (this.channel) {
			await this.channel.close();
			this.channel = undefined;
		}
		if (this.connection) {
			await this.connection.close();
			this.connection = undefined;
		}
		console.log('Disconnected from RabbitMQ.');
	}

	/**
	 * Publishes a message to a queue.
	 */
	async publish(queue: string, message: Buffer | string, options?: Options.Publish): Promise<Replies.Empty> {
		if (!this.channel) {
			throw new Error('Channel is not initialized. Call connect() first.');
		}
		await this.channel.assertQueue(queue, { durable: true });
		const sent = this.channel.sendToQueue(queue, Buffer.isBuffer(message) ? message : Buffer.from(message), options);
		if (!sent) {
			throw new Error('Failed to send message to queue.');
		}
		return {} as Replies.Empty;
	}

	/**
	 * Subscribes to a queue and processes messages.
	 */
	async subscribe(queue: string, callback: (message: Buffer | string) => void): Promise<void> {
		if (!this.channel) {
			throw new Error('Channel is not initialized. Call connect() first.');
		}
		await this.channel.assertQueue(queue, { durable: true });
		await this.channel.consume(queue, (message) => {
			if (message) {
				callback(message.content);
				this.channel?.ack(message);
			}
		});
	}
}

/* * */

/**
 * Singleton class for RabbitMQConnector.
 */
class RabbitMQService extends RabbitMQConnector {
	private static _instance: RabbitMQService;

	private constructor() {
		if (!process.env.RABBITMQ_URI) {
			throw new Error('Missing "RABBITMQ_URI" environment variable');
		}

		super({ uri: process.env.RABBITMQ_URI });
	}

	public static async getInstance() {
		if (!RabbitMQService._instance) {
			const instance = new RabbitMQService();
			await instance.connect();
			RabbitMQService._instance = instance;
		}
		return RabbitMQService._instance;
	}
}

export const rabbitMQ = asyncSingletonProxy(RabbitMQService);
