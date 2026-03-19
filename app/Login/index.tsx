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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import { router } from "expo-router";

const LoginView = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Thành công", "Đăng nhập thành công!");
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Lỗi đăng nhập", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập email để lấy lại mật khẩu");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Đã gửi email",
        "Vui lòng kiểm tra hộp thư để đặt lại mật khẩu!",
      );
    } catch (error: any) {
      Alert.alert("Lỗi", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Nhập</Text>

      {/* Email Input */}
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

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Image
          style={[styles.icon, styles.inputIcon]}
          source={{ uri: "https://img.icons8.com/ios-glyphs/512/key.png" }}
        />
        <TextInput
          style={styles.inputs}
          placeholder="Mật khẩu"
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

      {/* Forgot Password */}
      <TouchableOpacity
        style={styles.restoreButtonContainer}
        onPress={handleForgotPassword}
      >
        <Text style={styles.forgotText}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.buttonContainer, styles.loginButton]}
        onPress={handleEmailLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginText}>Đăng Nhập</Text>
        )}
      </TouchableOpacity>

      {/* Register Button */}
      <TouchableOpacity
        style={[styles.buttonContainer, styles.registerButton]}
        onPress={() => router.push("/Register")}
      >
        <Text style={styles.registerText}>Tạo tài khoản mới</Text>
      </TouchableOpacity>

      {/* Facebook Login */}
      <Text style={styles.orText}>— hoặc —</Text>
      <TouchableOpacity style={[styles.buttonContainer, styles.facebookButton]}>
        <View style={styles.socialButtonContent}>
          <Image
            style={styles.icon}
            source={{
              uri: "https://img.icons8.com/color/70/000000/facebook.png",
            }}
          />
          <Text style={styles.loginText}>Tiếp tục với Facebook</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#B0E0E6",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
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
  loginButton: { backgroundColor: "#3498db" },
  registerButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#3498db",
  },
  facebookButton: { backgroundColor: "#3b5998" },
  loginText: { color: "white", fontWeight: "600", marginLeft: 8 },
  registerText: { color: "#3498db", fontWeight: "600" },
  forgotText: { color: "#7f8c8d", fontSize: 13 },
  restoreButtonContainer: {
    width: 280,
    marginBottom: 15,
    alignItems: "flex-end",
  },
  socialButtonContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  orText: { color: "#7f8c8d", marginVertical: 10, fontSize: 13 },
});

export default LoginView;
