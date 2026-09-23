package com.example.demo.config;

import java.net.URI;

/**
 * Render consegna il database in una variabile sola, DATABASE_URL, scritta cosi':
 *
 *     postgresql://utente:password@host:5432/nome_db
 *
 * Il driver JDBC pretende invece tre informazioni separate e un indirizzo che
 * comincia con jdbc:postgresql://, senza credenziali dentro. Spring Boot non
 * interpreta DATABASE_URL: la conversione si fa qui e il risultato finisce nelle
 * system property, che hanno la precedenza su application.yml. In locale la
 * variabile non esiste e restano validi i valori del file.
 */
public final class DatabaseUrl {

	private DatabaseUrl() {
	}

	public static void applicaSePresente() {
		String grezzo = System.getenv("DATABASE_URL");
		if (grezzo == null || grezzo.isBlank()) {
			return;
		}
		if (grezzo.startsWith("jdbc:")) {
			System.setProperty("spring.datasource.url", grezzo);
			return;
		}

		URI uri = URI.create(grezzo.trim());
		String[] credenziali = uri.getUserInfo() == null ? new String[0] : uri.getUserInfo().split(":", 2);
		int porta = uri.getPort() == -1 ? 5432 : uri.getPort();

		// sslmode=require va bene sia per la connessione interna che per quella esterna.
		String jdbc = "jdbc:postgresql://%s:%d%s?sslmode=require".formatted(uri.getHost(), porta, uri.getPath());

		System.setProperty("spring.datasource.url", jdbc);
		if (credenziali.length > 0) {
			System.setProperty("spring.datasource.username", credenziali[0]);
		}
		if (credenziali.length > 1) {
			System.setProperty("spring.datasource.password", credenziali[1]);
		}

		// La password non si stampa mai nei log.
		System.out.println("[database] DATABASE_URL tradotta in " + jdbc);
	}
}
