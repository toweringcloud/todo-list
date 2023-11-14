import { StatusBar } from "expo-status-bar";
import { Fontisto, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { theme } from "./Colors";

const STORAGE_KEY = "@toDos";
const VISITED_KEY = "@lastStay";

export default function App() {
	const [working, setWorking] = useState(true);
	const [text, setText] = useState("");
	const [textEdit, setTextEdit] = useState("");
	const [toDos, setToDos] = useState({});

	const saveToDos = async (toSave) => {
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
	};
	const loadToDos = async () => {
		const s = await AsyncStorage.getItem(STORAGE_KEY);
		if (s) setToDos(JSON.parse(s));
	};
	const saveLastStay = async (flag) => {
		await AsyncStorage.setItem(VISITED_KEY, JSON.stringify(flag));
	};
	const loadLastStay = async () => {
		const v = await AsyncStorage.getItem(VISITED_KEY);
		if (v) setWorking(JSON.parse(v) === "W" ? true : false);
	};
	useEffect(() => {
		loadToDos();
		loadLastStay();
	}, []);

	const showTravel = () => {
		setWorking(false);
		saveLastStay("T");
	};
	const showWork = () => {
		setWorking(true);
		saveLastStay("W");
	};
	const updateText = (payload) => setText(payload);
	const updateTextEdit = (payload) => setTextEdit(payload);

	const finishToDo = async (key) => {
		const newToDos = { ...toDos };
		newToDos[key]["done"] = true;
		setToDos(newToDos);
		await saveToDos(newToDos);
	};
	const revertToDo = async (key) => {
		const newToDos = { ...toDos };
		newToDos[key]["done"] = false;
		setToDos(newToDos);
		await saveToDos(newToDos);
	};
	const updateFinishStatus = (key) => {
		toDos[key].done ? revertToDo(key) : finishToDo(key);
	};

	const enableEdit = async (key) => {
		const newToDos = { ...toDos };
		newToDos[key]["edit"] = true;
		setToDos(newToDos);
		await saveToDos(newToDos);
	};
	const disableEdit = async (key) => {
		const newToDos = { ...toDos };
		newToDos[key]["edit"] = false;
		setToDos(newToDos);
		await saveToDos(newToDos);
	};
	const updateEditStatus = (key) => {
		toDos[key].done
			? null
			: toDos[key].edit
			? disableEdit(key)
			: enableEdit(key);
	};

	const addToDo = async () => {
		if (text === "") return;
		const newToDos = {
			...toDos,
			[Date.now()]: { text, working, done: false },
		};
		setToDos(newToDos);
		await saveToDos(newToDos);
		setText("");
	};
	const modifyToDo = async (key, val) => {
		if (textEdit === "") return;
		const newToDos = { ...toDos };
		newToDos[key]["text"] = val;
		newToDos[key]["edit"] = false;
		setToDos(newToDos);
		await saveToDos(newToDos);
		setTextEdit("");
	};
	const removeToDo = (key) => {
		Alert.alert("Delete To Do", "Are you sure?", [
			{ text: "Cancel" },
			{
				text: "I'm Sure",
				style: "destructive",
				onPress: () => {
					const newToDos = { ...toDos };
					delete newToDos[key];
					setToDos(newToDos);
					saveToDos(newToDos);
				},
			},
		]);
	};

	return (
		<View style={styles.container}>
			<StatusBar style="auto" />
			<View style={styles.header}>
				<TouchableOpacity onPress={showWork}>
					<Text
						style={{
							...styles.btnText,
							color: working ? theme.light : theme.grey,
						}}
					>
						Work
					</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={showTravel}>
					<Text
						style={{
							...styles.btnText,
							color: !working ? theme.light : theme.grey,
						}}
					>
						Travel
					</Text>
				</TouchableOpacity>
			</View>
			<TextInput
				style={styles.input}
				onSubmitEditing={addToDo}
				onChangeText={updateText}
				returnKeyType="done"
				autoFocus={true}
				value={text}
				placeholder={
					working
						? "What do you have to do?"
						: "Where do you want to go?"
				}
			/>
			<ScrollView>
				{Object.keys(toDos).map((key) =>
					toDos[key].working === working ? (
						<View style={styles.toDo} key={key}>
							{toDos[key].edit ? (
								<TextInput
									id={key}
									style={styles.inputEdit}
									onSubmitEditing={(e) =>
										modifyToDo(key, e.nativeEvent.text)
									}
									onChangeText={updateTextEdit}
									returnKeyType="done"
									autoFocus={true}
									value={textEdit || toDos[key].text}
								/>
							) : (
								<Text
									style={
										toDos[key].done
											? {
													...styles.toDoText,
													color: theme.grey,
													textDecorationLine:
														"line-through",
											  }
											: styles.toDoText
									}
								>
									{toDos[key].text}
								</Text>
							)}
							<View style={styles.action}>
								<TouchableOpacity
									onPress={() => updateFinishStatus(key)}
								>
									<MaterialIcons
										name={
											toDos[key].done
												? "remove-done"
												: "done"
										}
										size={22}
										color={
											toDos[key].done || toDos[key].edit
												? theme.grey
												: theme.finish
										}
									/>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => updateEditStatus(key)}
								>
									<MaterialIcons
										name={
											toDos[key].edit
												? "edit-off"
												: "edit"
										}
										size={20}
										color={
											toDos[key].done
												? theme.grey
												: theme.update
										}
									/>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() =>
										toDos[key].done ? null : removeToDo(key)
									}
								>
									<Fontisto
										name="trash"
										size={18}
										color={
											toDos[key].done || toDos[key].edit
												? theme.grey
												: theme.delete
										}
									/>
								</TouchableOpacity>
							</View>
						</View>
					) : null
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.bg,
		paddingHorizontal: 20,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 100,
	},
	btnText: {
		fontSize: 38,
		fontWeight: "600",
	},
	input: {
		backgroundColor: theme.light,
		paddingVertical: 15,
		paddingHorizontal: 20,
		borderRadius: 30,
		marginVertical: 20,
		fontSize: 18,
	},
	inputEdit: {
		flex: 0.7,
		backgroundColor: theme.light,
		paddingHorizontal: 10,
		borderRadius: 10,
		fontSize: 14,
	},
	toDo: {
		backgroundColor: theme.toDoBg,
		marginBottom: 10,
		paddingVertical: 20,
		paddingHorizontal: 20,
		borderRadius: 15,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	toDoText: {
		color: theme.light,
		fontSize: 16,
		fontWeight: "600",
	},
	action: {
		width: 90,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
});
