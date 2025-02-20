/**
 * @name UserTagDisplay
 * @author Aym
 * @authorId 291798452130545664
 * @authorLink https://www.youtube.com/@aymm-x
 * @description Transformez l'affichage des messages sur Discord ! Ce plugin pour BetterDiscord vous permet de personnaliser l'affichage des noms d'utilisateur et des pseudos, afin de les rendre plus clairs et personnalisés selon vos préférences. Choisissez entre plusieurs formats, incluez des noms d'affichage et rendez vos conversations encore plus uniques !
 * @version 0.0.1
 * @website https://aymlol.netlify.app/aym.lol/$
 * @invite https://discord.gg/UaWKPsr5tU
 * @source https://github.com/Aym/BetterDiscordPlugins/blob/main/UserTagDisplay/UserTagDisplay.plugin.js
 */
 
const request = require("request");
const fs = require("fs");
const path = require("path");

const config = {
	info: {
		name: "UserTagDisplay",
		authors: [
			{	
				name: "Aym",
				discord_id: "291798452130545664",
				github_username: "aymm-x",
				twitter_username: "aymm-x"
			}
		],
		version: "0.0.1",
		description: "Personnalisez l'affichage des noms d'utilisateur sur Discord ! Avec ce plugin BetterDiscord, modifiez facilement les pseudos et ajoutez des touches uniques à vos conversations, pour un chat encore plus dynamique et personnalisé.",
		github: "https://github.com/Aym/BetterDiscordPlugins/blob/main/UserTagDisplay/UserTagDisplay.plugin.js",
		github_raw: "https://raw.githubusercontent.com/Aym/BetterDiscordPlugins/main/UserTagDisplay/UserTagDisplay.plugin.js"
	},
	changelog: [
		{
			title: "Corrections",
			type: "fixed",
			items: [
				"`[0.0.1]` Ajustement des noms d'utilisateur à côté des pseudos",
			]
		},
		{
			title: "Ajouts",
			type: "added",
			items: [
				"`[0.0.1]` Ajout de la possibilité de masquer le nom d'utilisateur dans les réponses.",
			]
		},
	],
	defaultConfig: [
		{
			type: "textbox",
			id: "handlesymbol",
			name: "[Nécessite un redémarrage pour être pleinement appliqué] Symbole du préfixe du nom d'utilisateur",
			note: "Le symbole utilisé comme préfixe pour les noms d'utilisateur (le @ dans @nomdutilisateur).",
			placeholder: "Laissez vide pour aucun; par défaut : @",
			value: "@"
		},
		{
			type: "color",
			id: "usernamecolor",
			name: "Couleur du nom d'utilisateur",
			note: "La couleur utilisée pour afficher le nom d'utilisateur dans le chat",
			value: "#F0F0F0"
		},
		{
			type: "color",
			id: "seperatorcolor",
			name: "Couleur du séparateur",
			note: "La couleur utilisée pour le symbole qui sépare le nom d'utilisateur du timestamp du message (@nomdutilisateur • timestamp) ou le suffixe dans les réponses (@nomdutilisateur: message)",
			value: "#F0F0F0"
		},
		{
			type: "switch",
			id: "usernamechat",
			name: "Afficher le nom d'utilisateur dans le chat",
			note: "Affiche le nom d'utilisateur de l'auteur du message à côté du timestamp du message.",
			value: true
		},
		{
			type: "switch",
			id: "showinreplies",
			name: "Afficher le nom d'utilisateur dans les réponses de chat",
			note: "Affiche le nom d'utilisateur dans le texte du message répondu.",
			value: true
		},
		{
			type: "switch",
			id: "profilecard",
			name: "Afficher le préfixe du nom d'utilisateur dans la carte de profil et la liste d'amis",
			note: "Affiche le préfixe du nom d'utilisateur dans les cartes de profil/popups ainsi que dans la liste d'amis.",
			value: true
		},
		{
			type: "switch",
			id: "friendslist",
			name: "Toujours afficher le nom d'utilisateur dans la liste d'amis",
			note: "Force Discord à toujours afficher les noms d'utilisateur à côté des pseudos dans la liste d'amis. Désactivez-le pour revenir au comportement par défaut de Discord (n'afficher que lorsque vous survolez).",
			value: true
		}
	]
};

module.exports = !global.ZeresPluginLibrary ? class {
	
	constructor() {
		this._config = config;
	}
	
	load() {
		BdApi.showConfirmationModal("Le plugin de bibliothèque est nécessaire",
			`Le plugin de bibliothèque nécessaire pour ZeresPluginLibrary est manquant. Cliquez sur Télécharger maintenant pour l'installer.`, {
			confirmText: "Télécharger",
			cancelText: "Annuler",
			onConfirm: () => {
				request.get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", (error, response, body) => {
					if (error)
						return electron.shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");

					fs.writeFileSync(path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body);
				});
			}
		});
	}
	
	start() { }
	stop() { }
	
} : (([Plugin, Library]) => {
	
	const { DiscordModules, WebpackModules, Patcher, PluginUtilities } = Library;
	const { React } = DiscordModules;
	
	class plugin extends Plugin {
		
		constructor() {
			super();
		}


		onStart() {
			
			this.applyStyles();
			
			if(this.settings.usernamechat) this.applyUsername();
			
		}

		onStop() {
			Patcher.unpatchAll();
			this.removeStyles();
		}
		
		getSettingsPanel() {
			
			const panel = this.buildSettingsPanel();
			
			panel.addListener((id, val) => {
				switch(id) {
				case "usernamechat":
					if(val)
						this.applyUsername();
					else
						Patcher.unpatchAll();
					break;
				case "showinreplies":
				case "usernamecolor":
				case "seperatorcolor":
				case "profilecard":
				case "friendslist":
					this.removeStyles();
					this.applyStyles();
					break;
				default:
					break;
				}
			});
			
			return panel.getElement();
		}
		
		applyStyles() {
			PluginUtilities.addStyle(
				"UserTagDisplay-ChatMessage", 
				`
				/* style du nom d'utilisateur dans les messages */
				.hg-username-handle {
					margin-left: 0.25rem;
					font-size: 0.93rem;
					color: ${this.settings.usernamecolor};
				}
				/* séparateur */
				.hg-username-handle::after {
					margin-left: 0.3rem;
					content: "•";
					color: ${this.settings.seperatorcolor};
				}
				/* correction du margin du timestamp (Discord aime le changer aléatoirement) */
				.roleDot_c01716, .cozy_f5c119 .headerText_f47574, .compact__54ecc .headerText_f47574 {
					margin-right: 0 !important;
				}
				/* masquer le nom d'utilisateur dans les réponses de commande */
				.repliedMessage_f9f2ca > .hg-username-handle {
					display: none;
				}
				/* mais ne pas masquer le préfixe dans les réponses normales si l'utilisateur veut qu'ils soient visibles */
				[id*="message-reply-context-"] > .hg-username-handle {
					margin-left: 0;
					display: ${this.settings.showinreplies ? "inline" : "none"};
				}
				/* changer le séparateur dans les réponses */
				[id*="message-reply-context-"] > .hg-username-handle::after {
					margin-left: 0;
					content: ":  ";
				}
				`
			);
			if(this.settings.profilecard) PluginUtilities.addStyle(
				"UserTagDisplay-ProfileCard",
				`
				/* afficher le symbole du préfixe devant le nom d'utilisateur */
				span.userTagUsername_c32acf::before, /* cartes de profil */
				span.discriminator_f3939d::before /* liste d'amis */ {
					color: #777;
					content: "${this.settings.handlesymbol}";
				}
				`
			);
			if(this.settings.friendslist) PluginUtilities.addStyle(
				"UserTagDisplay-FriendsList",
				`
				/* toujours afficher le nom d'utilisateur dans la liste d'amis */
				.discriminator_f3939d {
					visibility: visible !important;
				}
				`
			);
		}
		
		removeStyles() {
			PluginUtilities.removeStyle("UserTagDisplay-ChatMessage");
			PluginUtilities.removeStyle("UserTagDisplay-ProfileCard");
			PluginUtilities.removeStyle("UserTagDisplay-FriendsList");
		}
		
		applyUsername() {
			
			const [ module, key ] = BdApi.Webpack.getWithKey(BdApi.Webpack.Filters.byStrings("userOverride", "withMentionPrefix"), { searchExports: false });
			
			Patcher.after(module, key, (_, args, ret) => {
				let author = args[0].message.author;
				let discrim = author.discriminator;
				if(discrim != "0000")
					ret.props.children.push(
						React.createElement("span", { class: "hg-username-handle" }, `(${this.settings.handlesymbol + author.username + (discrim != "0" ? "#" + discrim : "")})`)
					  );
			});
			
		}
		
	}
	return plugin;
	
})(global.ZeresPluginLibrary.buildPlugin(config));