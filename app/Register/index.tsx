import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import { router } from "expo-router";

const RegisterView = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(userCredential.user, { displayName: name });
      Alert.alert("Thành công", "Tạo tài khoản thành công!", [
        { text: "OK", onPress: () => router.replace("/Login") },
      ]);
    } catch (error: any) {
      Alert.alert("Lỗi đăng ký", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tạo Tài Khoản</Text>
      <Text style={styles.subtitle}>Đăng ký để bắt đầu</Text>

      {/* Name */}
      <View style={styles.inputContainer}>
        <Image
          style={[styles.icon, styles.inputIcon]}
          source={{ uri: "https://img.icons8.com/ios-filled/512/user.png" }}
        />
        <TextInput
          style={styles.inputs}
          placeholder="Họ và tên"
          autoCapitalize="words"
          underlineColorAndroid="transparent"
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Email */}
      <View style={styles.inputContainer}>
        <Image
          style={[styles.icon, styles.inputIcon]}
          source={{
            uri: "https://img.icons8.com/ios-filled/512/circled-envelope.png",
          }}
        />
        <TextInput
          style={styles.inputs}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          underlineColorAndroid="transparent"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Password */}
      <View style={styles.inputContainer}>
        <Image
          style={[styles.icon, styles.inputIcon]}
          source={{ uri: "https://img.icons8.com/ios-glyphs/512/key.png" }}
        />
        <TextInput
          style={styles.inputs}
          placeholder="Mật khẩu (ít nhất 6 ký tự)"
          secureTextEntry={!showPassword}
          underlineColorAndroid="transparent"
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={22}
            color="#7f8c8d"
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Password */}
      <View style={styles.inputContainer}>
        <Image
          style={[styles.icon, styles.inputIcon]}
          source={{ uri: "https://img.icons8.com/ios-glyphs/512/key.png" }}
        />
        <TextInput
          style={styles.inputs}
          placeholder="Xác nhận mật khẩu"
          secureTextEntry={!showConfirmPassword}
          underlineColorAndroid="transparent"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
            size={22}
            color="#7f8c8d"
          />
        </TouchableOpacity>
      </View>

      {/* Register Button */}
      <TouchableOpacity
        style={[styles.buttonContainer, styles.registerButton]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.registerText}>Đăng Ký</Text>
        )}
      </TouchableOpacity>

      {/* Back to Login */}
      <TouchableOpacity
        style={[styles.buttonContainer, styles.backButton]}
        onPress={() => router.push("/Login")}
      >
        <Text style={styles.backText}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#B0E0E6",
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 30,
  },
  inputContainer: {
    borderBottomColor: "#F5FCFF",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    borderBottomWidth: 1,
    width: 280,
    height: 45,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  inputs: {
    height: 45,
    marginLeft: 16,
    borderBottomColor: "#FFFFFF",
    flex: 1,
  },
  icon: { width: 30, height: 30 },
  inputIcon: { marginLeft: 15 },
  eyeIcon: { paddingHorizontal: 12 },
  buttonContainer: {
    height: 45,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    width: 280,
    borderRadius: 30,
  },
  registerButton: {
    backgroundColor: "#2ecc71",
    marginTop: 5,
  },
  backButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#3498db",
  },
  registerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  backText: {
    color: "#3498db",
    fontWeight: "600",
  },
});

export default RegisterView;
